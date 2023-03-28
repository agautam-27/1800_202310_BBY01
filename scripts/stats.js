// Get the button element
var getDataButton = document.getElementById("stats");

// Add an event listener to the button
getDataButton.addEventListener("click", function () {
  // Get a reference to the section where you want to display the data
  var dataSection = document.getElementById("statSection");

  dataSection.innerHTML = "";

  currentUser = db.collection("users").doc(userID); // will to to the firestore and go to the document of the user
  currentUser.get().then((userDoc) => {
    // Create a new paragraph element to display the data
    var dataElement = document.createElement("ul");

    // Set the text content of the paragraph element to the data from Firestore
    var countryText = "Country: " + userDoc.data().country;
    var emailText = "Email: " + userDoc.data().email;
    var cityText = "City: " + userDoc.data().city;
    var pointsText = "Points: " + (userDoc.data().points !== undefined ? userDoc.data().points : 0);
    var countryItem = document.createElement("li");
    var emailItem = document.createElement("li");
    var cityItem = document.createElement("li");
    var pointsItem = document.createElement("li");

    countryItem.textContent = countryText;
    emailItem.textContent = emailText;
    cityItem.textContent = cityText;
    pointsItem.textContent = pointsText;

    countryItem.classList.add("country");
    emailItem.classList.add("email");
    cityItem.classList.add("city");
    pointsItem.classList.add("points");

    dataElement.style.listStyleType = "none";

    countryItem.style.fontSize = "40px";
    emailItem.style.fontSize = "40px";
    cityItem.style.fontSize = "40px";
    pointsItem.style.fontSize = "40px";

    dataElement.appendChild(countryItem);
    dataElement.appendChild(emailItem);
    dataElement.appendChild(cityItem);
    dataElement.appendChild(pointsItem);
    dataSection.appendChild(dataElement);
  });
});
