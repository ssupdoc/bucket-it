window.onload = () => {
    fetchNearbyPlaces()
}

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
            },
            () => {
                // handleLocationError(true, infoWindow, map.getCenter());
                addMarker(map, AUCKLAND_LOCATION, 'You are here')
            }
        );
    } else {
        // Browser doesn't support Geolocation
        // handleLocationError(false, infoWindow, map.getCenter());
        addMarker(map, AUCKLAND_LOCATION, 'You are here')
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
function fetchNearbyPlaces() {
    fetch('/js/mock.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                placeMaster = data
                renderNearbyPlaces(data)
            }
        });
}

function renderNearbyPlaces(nearbyPlaces) {
    let $nearbyPlacesDiv = document.getElementById('nearby-places')
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

function addToBucketList(event) {
    const placeId = event.target.id.split('-')[1]
    let $bucketList = document.getElementById('bucket-list')
    let place = placeMaster.find(place => place.id == placeId)
    let tileDiv = `
    <div class="tile is-ancestor" id="bucket-tile-${place.id}">
        <div class="tile is-vertical">
            <div class="tile is-parent">
            <div class="tile is-child notification tile-color">
                <img src="${place.image}">
                <p class="subtitle has-text-centered">${place.name}</p>
                <label class="checkbox is-pulled-right">
                        <input type="checkbox">
                        Done
                    </label>
            </div>
            </div>
        </div>
    </div>`
    $bucketList.innerHTML += tileDiv

    removeFromNearbyPlaces(placeId)
}

function removeFromNearbyPlaces(id) {
    let $place = document.getElementById('place-tile-' + id)
    $place.remove()
}