"use strict";

//firebase DOM elements
var signInButtonElement = document.getElementById("login");

//login listener
signInButtonElement.addEventListener("click", login);

initFirebaseAuth();//upon loading check the auth status of the user

function authStateObserver(user) {
  
  var user = firebase.auth().currentUser;//authentication observer that holds user details

  if (user) {
    // User is signed in.
    window.alert("Welcome back, " + user.displayName + "!");   // set pop up to see if it's getting here.

    //send the user to their profile page
    window.location.href = "dashboard.html";

  } else {
    // No user is signed in.
  }
}

// Signs-in Dash Browns.
function login() {
  
	var userEmail = document.getElementById("emailInput").value;
  var userPassword = document.getElementById("passwordInput").value;

  //TODO: verify userEmail is valid

  //TODO: verify userPassword is valid

  firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
      .then(function(firebaseUser) {
          // Successful login
          console.log("Sign-in success");
      })
      .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          
          window.alert("Error: " + errorMessage);
      });

}

// Initiate Firebase Auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

function getUserId() {
  return firebase.auth().currentUser.uid;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}
