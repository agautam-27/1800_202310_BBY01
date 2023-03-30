// Get a reference to the points element in the HTML
const pointsElement = document.querySelector(".points-count");

// Get a reference to the redeem button and rewards container in the HTML
const redeemButton = document.querySelector(".redeem-button");
const rewardsContainer = document.querySelector(".rewards-container");

// Listen for the Firebase Auth state change
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // If the user is signed in, call the populatePoints function with the user's ID
    populatePoints(user.uid);
  }
});

// Populate the user's points
function populatePoints(userId) {
  const userRef = db.collection("users").doc(userId);
  userRef.get().then((doc) => {
    const points = doc.data().points;
    console.log("Points:", points);
    if (points) {
      pointsElement.textContent = points;

      // Get all cards
      const cards = document.querySelectorAll('.card');

      // Loop through each card
      cards.forEach(card => {
        // Get the claim button for this card
        const claimBtn = card.querySelector('.claim-btn');
        // Add a click event listener to the claim button
        claimBtn.addEventListener('click', () => {
          const pointsToClaim = parseInt(claimBtn.textContent.match(/\d+/)[0]);
          // Check if the user has enough points to claim the reward
          if (points >= pointsToClaim) {
            // Subtract the points from the user's points in Firestore
            userRef.update({ points: points - pointsToClaim })
            .then(() => {
              // Update the points element in the HTML
              pointsElement.textContent = points - pointsToClaim;
              // Flip the card by toggling the "flipped" class
              card.classList.toggle('flipped');
              // Add the clicked class to the card
              card.classList.add('clicked');
            })
            .catch((error) => {
              console.error("Error updating points: ", error);
            });
          } else {
            // Add the vibrate class to the card element
            card.classList.add('vibrate');
            // Remove the vibrate class after 0.3 seconds
            setTimeout(() => {
              card.classList.remove('vibrate');
            }, 300);
          }
        });
      });
    }
  });
}