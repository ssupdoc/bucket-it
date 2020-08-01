window.onload = () => {
    fetchNearbyPlaces()
}

/**
 * Fetches nearby places from API
 */
function fetchNearbyPlaces() {
    fetch('mock.json')
        .then(response => response.json())
        .then(data => {
            if(data && data.length) {
                renderNearbyPlaces(data)
            }
        });
}

function renderNearbyPlaces(nearbyPlaces) {
    
}