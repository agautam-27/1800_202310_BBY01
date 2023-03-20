  
// Create a Firestore reference
var firestore = firebase.firestore();


var map = L.map('map').setView([49.1913, -122.8490], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.Routing.control({
    waypoints: [
        L.latLng(57.74, 11.94),
        L.latLng(57.6792, 11.949)
    ],
    routeWhileDragging: true
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