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
