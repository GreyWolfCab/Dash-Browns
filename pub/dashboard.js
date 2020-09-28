"use strict";

//firebase DOM elements
var signInButtonElement = document.getElementById("logout");

//login listener
signInButtonElement.addEventListener("click", signOut);

initFirebaseAuth();//upon loading check the auth status of the user

function authStateObserver(user) {
  
    var user = firebase.auth().currentUser;//authentication observer that holds user details
  
    if (user) {

        console.log(user.uid);
        console.log(user.email);
        console.log(user.displayName);
  
    } else {
      // No user is signed in.
      window.alert("Please login again.");
      //send the user to the login page
        window.location.href = "login.html";
    }
  }

// Signs-out of Dash Browns.
function signOut() {
    // Sign out of Firebase.
    firebase.auth().signOut();
}

// Initiate Firebase Auth.
function initFirebaseAuth() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
  }