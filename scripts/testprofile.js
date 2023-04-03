

// Get a reference to the "users" collection in Firebase
const usersRef = db.collection("users");

// Listen for the Firebase Auth state change
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is logged in, so add click event listener to new button
    const newButton = document.getElementById("new-button");
    newButton.addEventListener("click", () => {
      // Get a reference to the user's "favorites" subcollection
      const userId = user.uid;
      const favoritesRef = usersRef.doc(userId).collection("favorites");

      // Call the populateFavorites function to display the favorites
      populateFavorites(userId, favoritesRef);
    });
  }
});


function populateFavorites(userId) {
    // Get a reference to the favorites subcollection for the current user
    const favoritesRef = db.collection("users").doc(userId).collection("favorites");
  
    // Create an array to hold the favorite data
    const favoritesArr = [];
  
    // Fetch the documents from the favorites subcollection
    favoritesRef.get().then((querySnapshot) => {
      // Loop through each document in the favorites subcollection and add its data to the favorites array
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const latitude = data.latitude;
        const longitude = data.longitude;
        const name = data.name;
  
        favoritesArr.push({ latitude, longitude, name });
      });
  
      // Remove previous favorite elements before adding new ones
      const statSection = document.getElementById("statSection");
      while (statSection.firstChild) {
        statSection.removeChild(statSection.firstChild);
      }
  
      // Loop through the favorites array to create a new element for each favorite
      favoritesArr.forEach((favorite) => {
        const { name, latitude, longitude } = favorite;
  
        // Use a reverse geocoding service to convert the latitude and longitude into a human-readable location
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
          .then(response => response.json())
          .then(data => {
            // Get the location from the response data
            const location = data.display_name;
  
            // Create a new card to display the favorite data
            const card = document.createElement("div");
            card.classList.add("card");
  
            // Create a new element to display the favorite name
            const nameElement = document.createElement("h2");
            nameElement.textContent = name;
            card.appendChild(nameElement);
  
            // Create a new element to display the favorite location
            const locationElement = document.createElement("p");
            locationElement.textContent = location;
            card.appendChild(locationElement);
  
            // Add the card to the stat section
            statSection.appendChild(card);
          });
      });
    });
  }
  
  