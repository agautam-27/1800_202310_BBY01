// Get the navigation elements
const logoLink = document.querySelector('.logo a');
const headingLink = document.querySelector('h1 a');
const homeLink = document.querySelector('.menu li:first-child a');

// Add click event listeners to the navigation elements
logoLink.addEventListener('click', redirectToMain);
headingLink.addEventListener('click', redirectToMain);
homeLink.addEventListener('click', redirectToMain);

// Function to redirect to main.html or home.html based on authentication state
function redirectToMain(event) {
  event.preventDefault();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, redirect to main.html
      window.location.href = "main.html";
    } else {
      // No user is signed in, redirect to home.html
      window.location.href = "home.html";
    }
  });
}


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

  

  