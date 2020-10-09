"use strict";

var createAccountButtonElement = document.getElementById("create-account");

createAccountButtonElement.addEventListener("click", registerUser);

function registerUser() {

  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
    //upon successful account creation navigate to the login screen
    window.location.href = "login.html";
  }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      // [START_EXCLUDE]
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      // [END_EXCLUDE]

    });

}