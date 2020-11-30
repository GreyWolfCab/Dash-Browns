"use strict";

//firebase DOM elements
var signOutButtonElement = document.getElementById("logout");

//user referential elements
var userNameElement = document.getElementById("user-fullname");
var userWeightElement = document.getElementById("user-weight");
var userHeightElement = document.getElementById("user-height");
var userSexElement = document.getElementById("user-sex");

//logout listener
signOutButtonElement.addEventListener("click", signOut);

//firestore references
const usersReference = firebase.firestore().collection("Users");

//firebase storage references
const storageRef = firebase.storage().ref();

initFirebaseAuth();//upon loading check the auth status of the user

//execute anytime the user's authentication changes
function authStateObserver(user) {
  
    var user = firebase.auth().currentUser;//authentication observer that holds user details
    
    if (user) {//user successfully logged in
        
        getUserInfo();
        loadProfilePicture()

    } else {
      // No user is signed in.
      window.alert("Please login again.");
      //send the user to the login page
      window.location.href = "login.html";
    }

}

//get user profile data and display it to the user
function getUserInfo() {

    usersReference.doc(getUserId()).get()
    .then(function (querySnapshot) {
      if (querySnapshot.exists) {//verify the user is in the database
        //modify the html with the user's information
        userNameElement.textContent = querySnapshot.data().firstname + " " + querySnapshot.data().lastname;
        userWeightElement.textContent = "Weight: " + querySnapshot.data().weight + " lbs";
        userHeightElement.textContent = "Height: " + Math.floor(querySnapshot.data().height / 12) + "ft " + querySnapshot.data().height % 12 + "in";
        userSexElement.textContent = "Sex: " + querySnapshot.data().sex;
      }
    })
    .catch(function (error) {
      console.log("Error getting User information:", error);
    });
  
}

function loadProfilePicture() {
    const profileRef = storageRef.child("profile/" + getUserId());//load from the users id
    profileRef.getDownloadURL().then(function(url) {
      let profilePicture = document.getElementById("profilePicture");//setup profile picture in navbar
      profilePicture.src = url;
    }).catch(function(error) {
      if (error.code === 'storage/object-not-found') {
        //profile picture not found
      }
    });
  }
  
  // Signs-out of Dash Browns.
  function signOut() {
      // Sign out of Firebase.
      firebase.auth().signOut();
  }
  
  // Returns the signed-in user's ID.
  function getUserId() {
    return firebase.auth().currentUser.uid;
  }
  
  // Initiate Firebase Auth.
  function initFirebaseAuth() {
      // Listen to auth state changes.
      firebase.auth().onAuthStateChanged(authStateObserver);
  }