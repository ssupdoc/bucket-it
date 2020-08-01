window.onload = () => {
    fetchNearbyPlaces()
}

const AUCKLAND_LOCATION = { lat: -36.8483, lng: 174.7625 }

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
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
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
    fetch('mock.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                renderNearbyPlaces(data)
            }
        });
}

function renderNearbyPlaces(nearbyPlaces) {

}