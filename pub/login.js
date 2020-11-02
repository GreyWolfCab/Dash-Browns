"use strict";

//firebase DOM elements
var signInButtonElement = document.getElementById("login");
var userInfoSubmitButton = document.getElementById("user-info-submit");

//Overlay for creating new users
var userOverlayDivElement = document.getElementsByClassName("user-overlay")[0];

//login listener
signInButtonElement.addEventListener("click", login);

// upload profile pic listener
var uploadImageFile = document.getElementById("profile-pic-file");
uploadImageFile.addEventListener("change", uploadProfilePic);

//firestore references
const usersReference = firebase.firestore().collection("Users");

initFirebaseAuth();//upon loading check the auth status of the user

function authStateObserver(user) {
  
  user = firebase.auth().currentUser;//authentication observer that holds user details

  if (user) {// User is signed in.

    //check if the user account already exists in firestore
    usersReference.doc(user.uid).get()
    .then(function (docCopy) {
      if (docCopy.exists) {//send the user to their profile page
        window.location.href = "dashboard.html";
      } else {//user doesn't exist in firestore
        userInfoSubmitButton.addEventListener("click", collectUserData);//allows the user to setup their account
        changeOverlay()
      }
    });

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

  firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)//user logs into firebase with their credentials
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

//triggers pop-up page to get setup a new user account
function changeOverlay() {
  if (userOverlayDivElement.style.display === "none") {
      userOverlayDivElement.style.display = "block";
  } else {
      userOverlayDivElement.style.display = "none";

  }

}

function collectUserData() {

  const fName = document.getElementById("firstName").value;
  const lName = document.getElementById("lastName").value;
  const profilePicture = uploadImageFile.value;
  const bio = document.getElementById("bio").value;
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;
  const gender = document.getElementsByName("gender");
  var sex = 3;
  // get the value of the selected radio button
  for(var i = 0; i < gender.length; i++) {
    if(gender[i].checked)
    {
      sex = gender[i].value;
    }
  }

  //TODO validate given user data

  //create the new user in firestore
  createNewUser(fName, lName, bio, height, weight, sex, profilePicture);

}

function createNewUser(firstName, lastName, bio, height, weight, sex, profilePicture) {

  //TODO store profile pic to firestore

  // send to firestore
  firebase.firestore().collection('Users').doc(getUserId()).set({
    firstname: firstName,
    lastname: lastName,
    bio: bio,
    height: height,
    weight: weight,
    sex: sex,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    FriendsList: []
  }).then(function() {
    //redirect to dashboard upon successful creation
    window.location.href = "dashboard.html";
  }).catch(function(error) {
    console.error('Error writing new message to database', error);
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

// Returns the signed-in user's ID.
function getUserId() {
  return firebase.auth().currentUser.uid;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// displays uploaded profile picture
function uploadProfilePic() {
  var imageFile = uploadImageFile.files[0];
  // check file size
   if(imageFile.size > (2 * 1024 * 1024)) // 2MB file size limit for a user icon
   {
     alert("Image file size cannot exceed 2MB");
   }
   // change avatar img src to image user uploaded
   else 
   {
     var profileAvatar = document.getElementById("avatar");
     // sets avatar image src 
     profileAvatar.src = URL.createObjectURL(imageFile);
   }
 }