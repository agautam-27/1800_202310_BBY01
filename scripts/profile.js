var currentUser;

function populateInfo() {
    firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // go and get the curret user info from firestore
                currentUser = db.collection("users").doc(user.uid);

                currentUser.get()
                    .then(userDoc => {
                        let userName = userDoc.data().name;
                        let userSchool = userDoc.data().school;
                        let userCity = userDoc.data().city;
                        let picUrl = userDoc.data().profilePic; 

                        
                        if (picUrl != null){
                            console.log(picUrl);
								            // use this line if "mypicdiv" is a "div"
                            //$("#mypicdiv").append("<img src='" + picUrl + "'>")
                            $("#mypic-goes-here").attr("src", picUrl);
                        }
                        else
                        console.log("picURL is null");
                    })

            } else {
                console.log("no user is logged in")
            }
        }

    )

}
populateInfo();

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    firebase.auth().onAuthStateChanged(function (user) {
        var storageRef = storage.ref("images/" + user.uid + ".jpg");

        //Asynch call to put File Object (global variable ImageFile) onto Cloud
        storageRef.put(ImageFile)
            .then(function () {
                console.log('Uploaded to Cloud Storage.');

                //Asynch call to get URL from Cloud
                storageRef.getDownloadURL()
                    .then(function (url) { // Get "url" of the uploaded file
                        console.log("Got the download URL.");
												//get values from the from
                        userName = document.getElementById('nameInput').value;
                        userAddress = document.getElementById('addresslInput').value;
                        userCity = document.getElementById('cityInput').value;

                        //Asynch call to save the form fields into Firestore.
                        db.collection("users").doc(user.uid).update({
                                name: userName,
                                address: userAddress,
                                city: userCity,
                                profilePic: url // Save the URL into users collection
                            })
                            .then(function () {
                                console.log('Added Profile Pic URL to Firestore.');
                                console.log('Saved use profile info');
                                document.getElementById('personalInfoFields').disabled = true;
                            })
                    })
            })
    })
}

var userID;

function insertNameFromFirestore(){
    // to check if the user is logged in:
    firebase.auth().onAuthStateChanged(user =>{
        if (user){
           console.log(user.uid); // let me to know who is the user that logged in to get the UID
           userID = user.uid;
           currentUser = db.collection("users").doc(user.uid); // will to to the firestore and go to the document of the user
           currentUser.get().then(userDoc=>{
               //get the user name
               var userName= userDoc.data().name;
               console.log(userName);
               //$("#name-goes-here").text(userName); //jquery
               document.getElementById("name-goes-here").innerText=userName;
           })    
       }    
    })
}

insertNameFromFirestore();
//call the function to run it 


// * Favorites Button Fetching Data

// Get a reference to the "users" collection in Firebase
const usersRef = db.collection("users");

// Listen for the Firebase Auth state change
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is logged in, so add click event listener to favorites button
    const favoritesButton = document.getElementById("favorites-button");
    favoritesButton.addEventListener("click", () => {
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

 