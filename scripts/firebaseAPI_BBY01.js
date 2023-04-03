//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyDX9bKwQcSutAZCYahhEBp66qwp74IiNHQ",
  authDomain: "team-project-bby01.firebaseapp.com",
  projectId: "team-project-bby01",
  storageBucket: "team-project-bby01.appspot.com",
  messagingSenderId: "705307691312",
  appId: "1:705307691312:web:bf6bf1ffd9cd531fb860f5"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
var storage = firebase.storage();
var storage = firebase.storage();
