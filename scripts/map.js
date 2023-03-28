  
// Create a Firestore reference
var firestore = firebase.firestore();


var map = L.map('map');
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    // Success callback - center map on user's location
    var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
    map.setView(latlng, 13);
  }, function() {
    // Error callback - use default location
    map.setView([49.1913, -122.8490], 13);
  });
} else {
  // Geolocation not supported - use default location
  map.setView([49.1913, -122.8490], 13);
}

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.locate().addTo(map);

// //Routing Button
L.Routing.control({
    waypoints: [
    ],
    showAlternatives: true,
    collapsible: true,
    show: false,
    lineOptions: {
      styles: [{color: 'green', opacity: .7, weight: 5}]
   },
    altLineOptions: {
        styles: [
            {color: 'black', opacity: 0.15, weight: 9},
            {color: 'white', opacity: 0.8, weight: 6},
            {color: 'blue', opacity: 0.5, weight: 3}
        ]
    },
    geocoder: L.Control.Geocoder.nominatim(),
    routeWhileDragging: true,
    reverseWaypoints: true,
    autoComplete: true,
    autoRoute: true,
  }).addTo(map);


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
      if (confirmCreateMarker) {
        var conditions = ["snow", "ice", "flood"];

        // Create a popup with the options
        var popupContent = "Please select a condition:<br>";
        for (var i = 0; i < conditions.length; i++) {
          popupContent += "<input type='radio' name='condition' value='" + conditions[i] + "'>" + conditions[i] + "<br>";
        }
        popupContent += "<br><textarea id='comments-input' placeholder='Enter comments'></textarea><br>";
        popupContent += "<button id='save-button'>Save</button>";

        // Create the marker and add the popup
        var marker = L.marker(e.latlng).addTo(map);
        marker.bindPopup(popupContent).openPopup();

        marker.on("popupopen", function() {
          var saveButton = document.getElementById("save-button");
          saveButton.addEventListener("click", function(event) {
            var condition = document.querySelector("input[name='condition']:checked").value;
            var comments = document.getElementById("comments-input").value;
            var now = new Date();
            var dateTime = now.toLocaleString();

            var popupContent = "<b>Condition: </b>" + condition + "<br><b>Comments: </b>" + comments + "<br><b>Created at: </b>" + dateTime;
            marker.setPopupContent(popupContent);

            // Save the marker data to Firestore
            var user = firebase.auth().currentUser;
            if (user) {
              var markerData = {
                condition: condition,
                comments: comments,
                created_at: now,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
                user_id: user.uid // add this field to set the user ID
              };
              
              // Add Points to users
              firestore.collection("users").doc(user.uid).collection("markers").add(markerData).then(function(docRef) {
                console.log("Marker added to Firestore.");

                // Increment user's points
                firestore.collection("users").doc(user.uid).update({ points: firebase.firestore.FieldValue.increment(1) }).then(function() {
                  console.log("User's points incremented.");
                }).catch(function(error) {
                  console.error("Error incrementing user's points:", error);
                });

                // Add click event listener to marker to delete it
                marker.on("click", function() {
                  var confirmDeleteMarker = confirm("Do you want to delete this marker?");
                  if (confirmDeleteMarker) {
                    marker.remove(); // Remove the marker from the map
                    firestore.collection("users").doc(user.uid).collection("markers").doc(docRef.id).delete().then(function() {
                      console.log("Marker data deleted from Firestore.");
                    }).catch(function(error) {
                      console.error("Error deleting marker data from Firestore:", error);
                    });
                  }
                });

              }).catch(function(error) {
                console.error("Error adding marker to Firestore:", error);
              });
            } else {
              console.log("User not signed in.");
            }

            marker.closePopup();
         

            });
          });
        }
        }
    }, 2000);
  }
  
  function onMapMouseUp() {
    mouseDown = false;
    clearTimeout(longPressTimeout);
  }
  
  map.on('mousedown', onMapMouseDown);
  map.on('mouseup', onMapMouseUp);
  
  // Gets every marker on Firestore and puts it on the map
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      const markersRef = firestore.collectionGroup("markers");
  
      markersRef.get().then((querySnapshot) => {
        console.log("Retrieved markers:", querySnapshot.docs);
        querySnapshot.forEach((doc) => {
          const { latitude, longitude, condition, comments, created_at, user_id } = doc.data();
          const popupContent = `<b>Condition:</b> ${condition}<br> <b>Comment:</b> ${comments}<br><b>Created at:</b> ${created_at.toDate().toLocaleString()}`;
          const isCurrentUserMarker = user_id === user.uid; // check if the current marker was created by the current user
          const markerColor = isCurrentUserMarker ? "#00FF00" : "#ff7800"; // set a different marker color for the user's own markers
          const marker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: markerColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map);
          marker.bindPopup(popupContent);
        });
      }).catch((error) => {
        console.error("Error getting markers:", error);
      });
    }
  });

// Create a bookmarks object to store bookmarks
var bookmarks = {};

// Add a bookmark button to the map
L.easyButton('fa-bookmark', function() {
  var name = prompt('Enter a name for the bookmark:');
  if (name !== null && name !== '') {
    bookmarks[name] = map.getCenter();
    updateBookmarks();
  }
}).addTo(map);

// // Update the bookmarks list
// function updateBookmarks() {
//   var list = document.getElementById('bookmarks-list');
//   list.innerHTML = '';
//   for (var name in bookmarks) {
//     var li = document.createElement('li');
//     var a = document.createElement('a');
//     a.href = '#';
//     a.innerHTML = name;
//     a.onclick = (function(name) {
//       return function() {
//         map.setView(bookmarks[name], 13);
//       };
//     })(name);
//     li.appendChild(a);
//     list.appendChild(li);
//   }
// }

// // Add any initial bookmarks
// bookmarks['London'] = L.latLng(51.505, -0.09);

// // Update the bookmarks list initially
// updateBookmarks();

