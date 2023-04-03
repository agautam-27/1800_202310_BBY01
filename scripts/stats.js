var getDataButton = document.getElementById("stats");
getDataButton.addEventListener("click", function() {
  var dataSection = document.getElementById("statSection");
  dataSection.innerHTML = "";
  currentUser = db.collection("users").doc(userID);
  currentUser.get().then((userDoc) => {
    var dataElement = document.createElement("ul");
    var nameText = "Name: " + userDoc.data().name;
    var emailText = "Email: " + userDoc.data().email;
    var cityText = "City: " + userDoc.data().city;
    var countryText = "Country: " + userDoc.data().country;
    var pointsText = "Points: " + (userDoc.data().points !== undefined ? userDoc.data().points : 0);
    var nameItem = document.createElement("li");
    var emailItem = document.createElement("li");
    var cityItem = document.createElement("li");
    var countryItem = document.createElement("li");
    var pointsItem = document.createElement("li");

    nameItem.textContent = nameText;
    emailItem.textContent = emailText;
    cityItem.textContent = cityText;
    countryItem.textContent = countryText;
    pointsItem.textContent = pointsText;

    nameItem.classList.add("name");
    emailItem.classList.add("email");
    cityItem.classList.add("city");
    countryItem.classList.add("country");
    pointsItem.classList.add("points");

    dataElement.appendChild(nameItem);
    dataElement.appendChild(emailItem);
    dataElement.appendChild(cityItem);
    dataElement.appendChild(countryItem);
    dataElement.appendChild(pointsItem);

    dataSection.appendChild(dataElement);
  });
});
