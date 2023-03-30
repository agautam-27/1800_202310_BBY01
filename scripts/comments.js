// Get the collection reference for the desired collection
const collectionRef = db.collection("users");

// Get a reference to the container element
const container = document.getElementById("comment-container");

// Listen for the Firebase Auth state change
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    populateComments(user.uid);
  }
});

function populateComments(userId) {
  // Get a reference to the markers subcollection for the current user
  const markersRef = collectionRef.doc(userId).collection("markers");

  // Fetch the documents from the markers subcollection
  markersRef.get().then((querySnapshot) => {
    const commentsArr = [];
    // Loop through each document in the markers subcollection and get its "comments", "created_at", "latitude", and "longitude" fields
    querySnapshot.forEach((markerDoc) => {
      const comments = markerDoc.data().comments;
      const condition = markerDoc.data().condition;
      const created_at = markerDoc.data().created_at.toDate();
      const latitude = markerDoc.data().latitude;
      const longitude = markerDoc.data().longitude;
      
      commentsArr.push({
        comments: comments,
        condition: condition,
        created_at: created_at,
        latitude: latitude,
        longitude: longitude
      });
    });

    // Sort the comments array in descending order based on the created_at field
    commentsArr.sort((a, b) => b.created_at - a.created_at);

    // Loop through each comment in the sorted comments array and create a card for it
    commentsArr.forEach((commentObj) => {
      const card = document.createElement("div");
      card.classList.add("card", "mb-3");

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      const cardTitle = document.createElement("h5");
      cardTitle.classList.add("card-title");
      cardTitle.innerText = "Comment";

      const cardText = document.createElement("p");
      cardText.classList.add("card-text");
      cardText.innerText = commentObj.comments;

      const cardLocation = document.createElement("p");
      cardLocation.classList.add("card-location");
      // Reverse geocode the latitude and longitude to get the location
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${commentObj.latitude}&longitude=${commentObj.longitude}&localityLanguage=en`)
        .then((response) => response.json())
        .then((data) => {
          cardLocation.innerText = data.city + ", " + data.principalSubdivision;
        })
        .catch((error) => console.log(error));

      const cardDate = document.createElement("p");
      cardDate.classList.add("card-date");
      // Format the Unix timestamp to a human-readable date and time
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      cardDate.innerText = commentObj.created_at.toLocaleString('en-US', options);

      const cardCondition = document.createElement("p");
      cardCondition.classList.add("card-condition");
      cardCondition.innerText = "Condition: " + commentObj.condition;

      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardText);
      cardBody.appendChild(cardLocation);
      cardBody.appendChild(cardDate);
      cardBody.appendChild(cardCondition);
      card.appendChild(cardBody);
      container.appendChild(card);
    });
  });
}