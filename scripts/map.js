  
// Create a Firestore reference
var firestore = firebase.firestore();


var map = L.map('map').setView([49.1913, -122.8490], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



// //Routing Button
L.Routing.control({
    waypoints: [
    ],
    showAlternatives: true,
    altLineOptions: {
        styles: [
            {color: 'black', opacity: 0.15, weight: 9},
            {color: 'white', opacity: 0.8, weight: 6},
            {color: 'blue', opacity: 0.5, weight: 2}
        ]
    },
    geocoder: L.Control.Geocoder.nominatim(),
    routeWhileDragging: true,
    reverseWaypoints: true,
    autoComplete: true,
    autoRoute: true,
  }).addTo(map);

  

// // Create a new Leaflet control for the minimize button
var minimizeControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    
    onAdd: function (map) {
        // Create a container element for the button
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        
        // Create the button element and add it to the container
        var button = L.DomUtil.create('a', 'leaflet-control-minimize-button', container);
        button.title = 'Minimize Routing Machine';
        
        // Add a click event listener to the button
        L.DomEvent.on(button, 'click', function (event) {
            // Toggle the visibility of the routing control
            var routingControl = document.querySelector('.leaflet-routing-container');
            if (routingControl.style.display == 'none') {
                routingControl.style.display = 'block';
            } else {
                routingControl.style.display = 'none';
            }
            
            // Prevent the click event from propagating to the map
            L.DomEvent.stopPropagation(event);
        });
        
        return container;
    }
});

// Add the minimize button control to the map
map.addControl(new minimizeControl());



//Marker
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

                // Save the marker data to Firestore
                var user = firebase.auth().currentUser;
                if (user) {
                    var markerData = {
                        condition: condition,
                        created_at: now,
                        latitude: e.latlng.lat,
                        longitude: e.latlng.lng,
                    };
                    // Add Points to users
                    firestore
                        .collection("users")
                        .doc(user.uid)
                        .collection("markers")
                        .add(markerData)
                        .then(function() {
                            console.log("Marker added to Firestore.");
                            // Increment user's points
                            firestore
                                .collection("users")
                                .doc(user.uid)
                                .update({ points: firebase.firestore.FieldValue.increment(1) })
                                .then(function() {
                                    console.log("User's points incremented.");
                                })
                                .catch(function(error) {
                                    console.error("Error incrementing user's points:", error);
                                });
                        })
                        .catch(function(error) {
                            console.error("Error adding marker to Firestore:", error);
                        });
                } else {
                    console.log("User not signed in.");
                }
            }
        }
    }, 2000);
}

// Clear the timeout if the user releases the mouse button before the 2-second mark
function onMapMouseUp() {
    mouseDown = false;
    clearTimeout(longPressTimeout);
}

map.on('mousedown', onMapMouseDown);
map.on('mouseup', onMapMouseUp);

// const markersRef = firestore.collection("users").doc(user.uid).collection("markers");

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      const markersRef = firestore.collection("users").doc(user.uid).collection("markers");
  
      markersRef.get().then((querySnapshot) => {
        console.log("Retrieved markers:", querySnapshot.docs);
        querySnapshot.forEach((doc) => {
            const { latitude, longitude, condition, created_at } = doc.data();
            const popupContent = `<b>Condition:</b> ${condition}<br><b>Created at:</b> ${created_at.toDate().toLocaleString()}`;
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(popupContent);
        });
      }).catch((error) => {
        console.error("Error getting markers:", error);
      });
    }
});

//Gets every marker on Firestore and puts it on the map
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      const markersRef = firestore.collectionGroup("markers");
  
      markersRef.get().then((querySnapshot) => {
        console.log("Retrieved markers:", querySnapshot.docs);
        querySnapshot.forEach((doc) => {
            const { latitude, longitude, condition, created_at } = doc.data();
            const popupContent = `<b>Condition:</b> ${condition}<br><b>Created at:</b> ${created_at.toDate().toLocaleString()}`;
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(popupContent);
        });
      }).catch((error) => {
        console.error("Error getting markers:", error);
      });
    }
});

