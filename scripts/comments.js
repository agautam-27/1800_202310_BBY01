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
    // Loop through each document in the markers subcollection and get its "comments" field
    querySnapshot.forEach((markerDoc) => {
      const comments = markerDoc.data().comments;
      // If comments is an array, loop through each comment and create a card for it
      if (Array.isArray(comments)) {
        comments.forEach((comment) => {
          const card = document.createElement("div");
          card.classList.add("card", "mb-3");

          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");

          const cardTitle = document.createElement("h5");
          cardTitle.classList.add("card-title");
          cardTitle.innerText = "Comment";

          const cardText = document.createElement("p");
          cardText.classList.add("card-text");
          cardText.innerText = comment;

          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardText);
          card.appendChild(cardBody);
          container.appendChild(card);
        });
      } else {
        // If comments is not an array, create a card for the single comment
        const card = document.createElement("div");
        card.classList.add("card", "mb-3");

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.innerText = "Comment";

        const cardText = document.createElement("p");
        cardText.classList.add("card-text");
        cardText.innerText = comments;

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        card.appendChild(cardBody);
        container.appendChild(card);
      }
    });
  });
}