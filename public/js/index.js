const AUCKLAND_LOCATION = { lat: -36.8483, lng: 174.7625 }
let placeMaster = []

/**
 * Render map based on current location
 */
function renderMap() {
    map = new google.maps.Map(document.getElementById("googleMap"), {
        center: AUCKLAND_LOCATION,
        zoom: 6
    });
    infoWindow = new google.maps.InfoWindow();
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                addMarker(map, pos, 'You are here')
                setMapView(map, pos, 10)
                fetchNearbyPlaces(pos)
            },
            () => {
                // handleLocationError(true, infoWindow, map.getCenter());
                addMarker(map, AUCKLAND_LOCATION, 'You are here')
                fetchNearbyPlaces(AUCKLAND_LOCATION)
            }
        );
    } else {
        // Browser doesn't support Geolocation
        // handleLocationError(false, infoWindow, map.getCenter());
        addMarker(map, AUCKLAND_LOCATION, 'You are here')
        fetchNearbyPlaces(AUCKLAND_LOCATION)
    }
}

/**
 * Handles location error based on error
 * @param {*} browserHasGeolocation flag for geolocation support with browser
 * @param {*} infoWindow info window in map
 * @param {*} pos the lat long to display the info window
 */
function handleLocationError(
    browserHasGeolocation,
    infoWindow,
    pos
) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

/**
 * Sets the view of the map
 * @param {*} map the map object
 * @param {*} pos the lat long to set view for
 * @param {*} zoom the zoom on the target
 */
function setMapView(map, pos, zoom) {
    map.setCenter(pos);
    map.setZoom(zoom);
}

/**
 * Adds marker on the map
 * @param {*} map the map object
 * @param {*} pos the lat long to set view for
 * @param {*} title the title of the marker
 */
function addMarker(map, pos, title) {
    let marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: title
    });
    return marker
}

/**
 * Fetches nearby places from API
 */
function fetchNearbyPlaces(coords) {
    fetch('/js/mock.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                placeMaster = sanitizeData(data)
                renderAllPlaces()
            }
        });
}

function renderAllPlaces() {
    renderNearbyPlaces(getFromPlaceMaster('nearby'))
    renderBucketList()
}

function sanitizeData(data) {
    let bucketList = getBucketList()
    data.forEach(place => {
        let bucketItem = bucketList.find(bucketPlace => bucketPlace.id === place.id)
        if (!bucketItem) {
            place.columnType = "nearby"
        } else {
            place.columnType = "bucket"
            place.checked = bucketItem.checked
        }
    })
    return data
}

function renderNearbyPlaces(nearbyPlaces) {
    let $nearbyPlacesDiv = document.getElementById('nearby-dynamic')
    $nearbyPlacesDiv.innerHTML = ''
    nearbyPlaces.forEach(place => {
        let tileDiv = `
        <div class="tile is-ancestor" id="place-tile-${place.id}">
            <div class="tile is-vertical">
                <div class="tile is-parent">
                <div class="tile is-child notification tile-color">
                    <img src="${place.image}">
                    <p class="subtitle has-text-centered">${place.name}</p>
                    <button id="bucket-${place.id}" onclick="addToBucketList(event)" class="button is-success is-small is-pulled-right">Bucket it!</button>
                </div>
                </div>
            </div>
        </div>`
        $nearbyPlacesDiv.innerHTML += tileDiv
    })
}

function renderBucketList() {
    let bucketList = getBucketList()
    let $bucketListDiv = document.getElementById('bucket-dynamic')
    $bucketListDiv.innerHTML = ''
    bucketList.forEach(place => {
        let tileDiv = `
        <div class="tile is-ancestor" id="place-tile-${place.id}">
            <div class="tile is-vertical">
                <div class="tile is-parent">
                    <div class="tile is-child notification tile-color">
                        <img src="${place.image}">
                        <p class="subtitle has-text-centered">${place.name}</p>
                        <label id="bucket-${place.id}" class="checkbox is-pulled-right">
                            <input id="check-${place.id}" type="checkbox" onclick="checkBucketItem(event)">
                            Done
                        </label>
                    </div>
                </div>
            </div>
        </div>`
        $bucketListDiv.innerHTML += tileDiv
    })

    bucketList.forEach(place => {
        let checkBox = document.getElementById('check-' + place.id)
        checkBox.checked = place.checked
    })
}

function addToBucketList(event) {
    const placeId = event.target.id.split('-')[1]
    let place = placeMaster.find(place => place.id == placeId)
    place.columnType = "bucket"
    addBucketItemToLocalStorage(place)
    renderAllPlaces()
}

function checkBucketItem(event) {
    const placeId = event.target.id.split('-')[1]
    let place = placeMaster.find(place => place.id == placeId)
    place.checked = !place.checked
    addBucketItemToLocalStorage(place)
    sanitizeData(placeMaster)
    renderAllPlaces()
}

function addBucketItemToLocalStorage(place) {
    let currentLocalStorage = getBucketList()
    let existingPlace = currentLocalStorage.find(storedPlace => storedPlace.id === place.id)
    if (!existingPlace) {
        currentLocalStorage.unshift(place)
    } else {
        existingPlace.checked = place.checked
    }
    localStorage.setItem('bucketList', JSON.stringify(currentLocalStorage))
}

function getBucketList() {
    let currentLocalStorage = localStorage.getItem('bucketList')
    if (currentLocalStorage) {
        currentLocalStorage = JSON.parse(currentLocalStorage)
    } else {
        currentLocalStorage = []
    }
    return currentLocalStorage
}

function removeFromNearbyPlaces(id) {
    let $place = document.getElementById('place-tile-' + id)
    $place.remove()
}

function getFromPlaceMaster(columnType) {
    return placeMaster.filter(place => place.columnType === columnType)
}