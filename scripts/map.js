  
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
      // var confirmCreateMarker = confirm("Do you want to mark a hazard here?");
      // if (confirmCreateMarker) {
        var conditions = ["Snow", "Ice", "Flood"];

        // Create a popup with the options
        var popupContent = "Please select a condition:<br>";
        for (var i = 0; i < conditions.length; i++) {
          popupContent += "<input type='radio' name='condition' value='" + conditions[i] + "'>" + conditions[i] + "<br>";
        }
        popupContent += "<br><textarea id='comments-input' placeholder='Enter comments'></textarea><br>";
        popupContent += "<button id='save-button'>Save</button>";
        popupContent += "<button id='favorite-button'>Favorite</button>";


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
            var favoriteButton = document.getElementById("favorite-button");
            favoriteButton.addEventListener("click", function(event) {
              var user = firebase.auth().currentUser;
              if (user) {
                var marker = L.marker(e.latlng, {
                  icon: L.icon({
                    iconUrl: "/images/favoriteIcon.png",
                    iconSize: [25, 25]
                  })
                }).addTo(map);
                marker.bindPopup("<input type='text' id='marker-name-input' placeholder='Enter name' required><br><button id='save-marker-button'>Save</button>").openPopup();

                var saveMarkerButton = document.getElementById("save-marker-button");
                saveMarkerButton.addEventListener("click", function() {
                  var name = document.getElementById("marker-name-input").value;
                  if (name){
                    var favoriteData = {
                    name: name,
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                  };
                
                // Add the favorite data to Firestore
                firestore.collection("users").doc(user.uid).collection("favorites").add(favoriteData).then(function(docRef) {
                  console.log("Favorite added to Firestore.");
                  
                  // Add click event listener to the marker to remove it and delete the favorite data from Firestore
                  marker.on("click", function() {
                    var confirmDeleteFavorite = confirm("Do you want to remove this location from favorites?");
                    if (confirmDeleteFavorite) {
                      marker.remove(); // Remove the marker from the map
                      firestore.collection("users").doc(user.uid).collection("favorites").doc(docRef.id).delete().then(function() {
                        console.log("Favorite data deleted from Firestore.");
                      }).catch(function(error) {
                        console.error("Error deleting favorite data from Firestore:", error);
                      });
                    }
                  });

                }).catch(function(error) {
                  console.error("Error adding favorite to Firestore:", error);
                });
                
                marker.closePopup(); // Close the marker's popup
              } else {
                alert("Please enter a name for the marker.");
              }
            });
          } else {
            console.log("User not signed in.");
          }
        });

          });
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
          
          let iconUrl;
          if (condition === "Snow") {
            iconUrl = "/images/snow.png";
          } else if (condition === "Ice") {
            iconUrl = "/images/ice.png";
          } else if (condition === "Flood") {
            iconUrl = "/images/flood.png";
          } else if (condition === "Other") {
            iconUrl = "/images/other.png";
          } else {
            iconUrl = "/images/default.png";
          }
          
          const marker = L.marker([latitude, longitude], {
            icon: L.icon({
              iconUrl: iconUrl,
              iconSize: [25, 25]
          }),
        }).addTo(map)

          marker.bindPopup(popupContent);
        });
      }).catch((error) => {
        console.error("Error getting markers:", error);
      });
    }
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      firestore.collection("users").doc(user.uid).collection("favorites")
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var favoriteData = doc.data();
          var favoriteMarker = L.marker([favoriteData.latitude, favoriteData.longitude], {
            icon: L.icon({
              iconUrl: "/images/favoriteIcon.png",
              iconSize: [25, 25]
            })
          }).addTo(map).bindPopup(favoriteData.name);
  
          var holdDuration = 0; // Initialize the hold duration to 0
          var holdTimer; // Declare the hold timer variable
  
          // Add mousedown event listener to the favorite marker to start the hold timer
          favoriteMarker.on("mousedown", function() {
            holdTimer = setInterval(function() {
              holdDuration += 100; // Increment the hold duration by 100 milliseconds
            }, 100);
          });
  
          // Add mouseup event listener to the favorite marker to stop the hold timer and show the remove favorite prompt if the hold duration is at least 2 seconds
          favoriteMarker.on("mouseup", function() {
            clearInterval(holdTimer); // Stop the hold timer
            if (holdDuration >= 1000) { // If the hold duration is at least 2 seconds
              var confirmDeleteFavorite = confirm("Do you want to remove this location from favorites?");
              if (confirmDeleteFavorite) {
                favoriteMarker.remove();
                firestore.collection("users").doc(user.uid).collection("favorites").doc(doc.id).delete().then(function() {
                  console.log("Favorite data deleted from Firestore.");
                }).catch(function(error) {
                  console.error("Error deleting favorite data from Firestore:", error);
                });
              }
            }
            holdDuration = 0; // Reset the hold duration to 0
          });
        });
      })
      .catch(function(error) {
        console.error("Error displaying favorites from Firestore:", error);
      });
  
    } else {
      console.log("User not signed in.");
    }
  });
  
// Add an "Info" button to the map using Leaflet EasyButton plugin
const infoButton = L.easyButton({
  position: "topright",
  states: [{
    stateName: "show-info",
    icon: "fa-info",
    title: "Show instructions",
    onClick: function(btn, map) {
      // Define the content of the popup window
      const popupContent = `
        <h3>Welcome to SnowGlobe! Let's Get Started</h3>
        <ol>
          <li>Hold Down on the map for 2 seconds to create a marker.</li>
          <li>To mark a hazard on the road:</li>
          <ol>
            <li>Select the condition</li>
            <li>Enter a comment</li>
            <li>Click "Save"</li>
          </ol>
          <li>To mark a favorite location:</li>
            <ol>
            <li>Select Favorite</li>
            <li>Enter a name</li>
            <li>Click "Save"</li>
            </ol>
        </ol>
      `;
      // Create and open a popup window with the instructions
      L.popup().setLatLng(map.getCenter()).setContent(popupContent).openOn(map);
      // Change the button state to "hide-info" to allow closing the popup window
      btn.state("hide-info");
    }
  }, {
    stateName: "hide-info",
    icon: "fa-times",
    title: "Hide instructions",
    onClick: function(btn, map) {
      // Close the popup window
      map.closePopup();
      // Change the button state to "show-info" to allow showing the popup window again
      btn.state("show-info");
    }
  }]
});

// Add the "Info" button to the map
infoButton.addTo(map);



  


