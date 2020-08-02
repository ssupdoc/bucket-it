window.onload = () => {
  fetchNearbyPlaces();
};

const AUCKLAND_LOCATION = { lat: -36.8483, lng: 174.7625 };
let placeMaster = [];
let map;

/**
 * Render map based on current location
 */
function renderMap() {
  map = new google.maps.Map(document.getElementById("googleMap"), {
    center: AUCKLAND_LOCATION,
    zoom: 6,
/*     styles: [
      {
        elementType: "geometry",
        stylers: [
          {
            color: "#f5f5f5",
          },
        ],
      },
      {
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#616161",
          },
        ],
      },
      {
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#f5f5f5",
          },
        ],
      },
      {
        featureType: "administrative.land_parcel",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#bdbdbd",
          },
        ],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [
          {
            color: "#eeeeee",
          },
        ],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575",
          },
        ],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [
          {
            color: "#e5e5e5",
          },
        ],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e",
          },
        ],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [
          {
            color: "#ffffff",
          },
        ],
      },
      {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [
          {
            color: "#dadada",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#616161",
          },
        ],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e",
          },
        ],
      },
      {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [
          {
            color: "#e5e5e5",
          },
        ],
      },
      {
        featureType: "transit.station",
        elementType: "geometry",
        stylers: [
          {
            color: "#eeeeee",
          },
        ],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          {
            color: "#c9c9c9",
          },
        ],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e",
          },
        ],
      },
    ], */
  });
  infoWindow = new google.maps.InfoWindow();
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        addMarker(map, pos, "You are here");
        setMapView(map, pos, 10);
      },
      () => {
        // handleLocationError(true, infoWindow, map.getCenter());
        addMarker(map, AUCKLAND_LOCATION, "You are here");
      }
    );
  } else {
    // Browser doesn't support Geolocation
    // handleLocationError(false, infoWindow, map.getCenter());
    addMarker(map, AUCKLAND_LOCATION, "You are here");
  }
}

/**
 * Handles location error based on error
 * @param {*} browserHasGeolocation flag for geolocation support with browser
 * @param {*} infoWindow info window in map
 * @param {*} pos the lat long to display the info window
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
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
function addMarker(map, pos, title, color = "blue") {
  let iconUrl = {
    url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
  };
  let marker = new google.maps.Marker({
    position: pos,
    map: map,
    title: title,
    icon: iconUrl,
  });

  google.maps.event.addListener(
    marker,
    "click",
    (function (marker) {
      return function () {
        if (infoWindow) {
          infoWindow.close();
        }
        infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(title);
        infoWindow.open(map, marker);
      };
    })(marker)
  );
  return marker;
}

/**
 * Fetches nearby places from API
 */
function fetchNearbyPlaces() {
  fetch("/js/mock.json")
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length) {
        placeMaster = sanitizeData(data);
        renderAllPlaces();
      }
    });
}

function renderAllPlaces() {
  renderNearbyPlaces(getFromPlaceMaster("nearby"));
  renderBucketList();
  addNearbyMarkers();
}

function addNearbyMarkers() {
  placeMaster.forEach((place) => {
    if (place.coords) {
      addMarker(map, place.coords, place.name, "red");
    }
  });
}

function sanitizeData(data) {
  let bucketList = getBucketList();
  data.forEach((place) => {
    let bucketItem = bucketList.find(
      (bucketPlace) => bucketPlace.id === place.id
    );
    if (!bucketItem) {
      place.columnType = "nearby";
    } else {
      place.columnType = "bucket";
      place.checked = bucketItem.checked;
    }
  });
  return data;
}

function renderNearbyPlaces(nearbyPlaces) {
  let $nearbyPlacesDiv = document.getElementById("nearby-dynamic");
  if (nearbyPlaces && nearbyPlaces.length) {
    $nearbyPlacesDiv.innerHTML = "";
    nearbyPlaces.forEach((place) => {
      let tileDiv = `
        <div class="card mb-2" id="place-tile-${place.id}">
            <div class="card-image">
                <figure class="image is-4by3">
                <img src="${place.image}" alt="Image">
                </figure>
            </div>
            <div class="card-content">
                <div class="media">
                    <div class="media-content">
                        <p class="title is-5">${place.name}</p>
                    </div>
                    <button id="bucket-${place.id}" onclick="addToBucketList(event)" class="button is-success is-small is-pulled-right">Bucket it!</button>
                </div>
            </div>
        </div>`;
      $nearbyPlacesDiv.innerHTML += tileDiv;
    });
  } else {
    $nearbyPlacesDiv.innerHTML =
      '<p class="mt-10 is-size-4 text-center"> Hurray! You have covered all nearby places </p>';
  }
}

function renderBucketList() {
  let bucketList = getBucketList();
  let $bucketListDiv = document.getElementById("bucket-dynamic");
  if (bucketList && bucketList.length) {
    $bucketListDiv.innerHTML = "";
    bucketList.forEach((place) => {
      /* let tileDiv = `
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
            </div>`; */
      let tileDiv = `
            <div class="card mb-2" id="place-tile-${place.id}">
                <div class="card-image">
                    <figure class="image is-4by3">
                    <img src="${place.image}" alt="Image">
                    </figure>
                </div>
                <div class="card-content">
                    <div class="media">
                        <div class="media-content">
                            <p class="title is-5">${place.name}</p>
                        </div>
                        <button class="button is-success" id="bucket-${place.id}">
                            <span class="icon is-small">
                            <i class="fas fa-check"></i>
                            </span>
                            <span>Done</span>
                        </button>
                    </div>
                </div>
            </div>`;
      $bucketListDiv.innerHTML += tileDiv;
    });
  } else {
    $bucketListDiv.innerHTML =
      '<p class="mt-10 is-size-4 text-center">Go for it and add to your bucket list!</p>';
  }

  bucketList.forEach((place) => {
    let checkBox = document.getElementById("check-" + place.id);
    checkBox.checked = place.checked;
  });
}

function addToBucketList(event) {
  const placeId = event.target.id.split("-")[1];
  let place = placeMaster.find((place) => place.id == placeId);
  place.columnType = "bucket";
  addBucketItemToLocalStorage(place);
  renderAllPlaces();
}

function checkBucketItem(event) {
  const placeId = event.target.id.split("-")[1];
  let place = placeMaster.find((place) => place.id == placeId);
  place.checked = !place.checked;
  addBucketItemToLocalStorage(place);
  sanitizeData(placeMaster);
  renderAllPlaces();
}

function addBucketItemToLocalStorage(place) {
  let currentLocalStorage = getBucketList();
  let existingPlace = currentLocalStorage.find(
    (storedPlace) => storedPlace.id === place.id
  );
  if (!existingPlace) {
    currentLocalStorage.unshift(place);
  } else {
    existingPlace.checked = place.checked;
  }
  localStorage.setItem("bucketList", JSON.stringify(currentLocalStorage));
}

function getBucketList() {
  let currentLocalStorage = localStorage.getItem("bucketList");
  if (currentLocalStorage) {
    currentLocalStorage = JSON.parse(currentLocalStorage);
  } else {
    currentLocalStorage = [];
  }
  return currentLocalStorage;
}

function removeFromNearbyPlaces(id) {
  let $place = document.getElementById("place-tile-" + id);
  $place.remove();
}

function getFromPlaceMaster(columnType) {
  return placeMaster.filter((place) => place.columnType === columnType);
}
