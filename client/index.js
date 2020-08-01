window.onload = () => {
    fetchNearbyPlaces()
}

function renderMap() {
    map = new google.maps.Map(document.getElementById("googleMap"), {
        center: { lat: -36.8483, lng: 174.7625},
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

                var marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'You are here'
                  });
                
                map.setCenter(pos);
                map.setZoom(10);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

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