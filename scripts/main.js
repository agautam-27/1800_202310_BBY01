function getNameAndImageFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // Do something for the currently logged-in user here:
      const userId = user.uid;

      // Get user document from Firestore
      firebase.firestore().collection("users").doc(userId).get()
        .then(doc => {
          if (doc.exists) {
            const userData = doc.data();
            const userName = userData.name;
            const userImage = userData.profilePic;
            // Update name and image elements
            document.getElementById("name-goes-here").innerText = userName;
            document.getElementById("user-image").src = userImage;
          } else {
            console.log("No such document!");
          }
        })
        .catch(error => {
          console.log("Error getting document:", error);
        });
    } else {
      // No user is signed in.
    }
  });
}

getNameAndImageFromAuth(); //run the function


// Event listener to log out user from the website
document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.querySelector('#logout');
  logoutButton.addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
      window.location.href = "home.html";
    }).catch(function(error) {
      console.error(error);
    });
  });
});

