var map = L.map('map').setView([49.1913, -122.8490], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// Set a variable to keep track of whether the mouse is being held down
var mouseDown = false;

// Set a variable to keep track of the timeout for the long press
var longPressTimeout;

// Add a marker to the map when the user clicks and holds for 3 seconds
function onMapMouseDown(e) {
    mouseDown = true;
    longPressTimeout = setTimeout(function() {
        if (mouseDown) {
            var confirmCreateMarker = confirm("Do you want to mark a hazard here?");
            if (confirmCreateMarker) {
                var condition = prompt("What is the hazard? (snow, ice, flood)");
                var now = new Date();
                var dateTime = now.toLocaleString();
                var popupContent = "<b>Condition: </b>" + condition + "<br><b>Created at: </b>" + dateTime;
                var marker = L.marker(e.latlng).addTo(map);
                marker.bindPopup(popupContent).openPopup();
            }
        }
    }, 2000);
}

// Clear the timeout if the user releases the mouse button before the 3-second mark
function onMapMouseUp() {
    mouseDown = false;
    clearTimeout(longPressTimeout);
}

map.on('mousedown', onMapMouseDown);
map.on('mouseup', onMapMouseUp);