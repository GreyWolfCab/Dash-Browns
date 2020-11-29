"use strict";

//firebase DOM elements
var signInButtonElement = document.getElementById("logout");
var userInfoSubmitButton = document.getElementById("user-info-submit");

//user referential elements
var userNameElement = document.getElementById("user-fullname");
var userWeightElement = document.getElementById("user-weight");
var userHeightElement = document.getElementById("user-height");
var userSexElement = document.getElementById("user-sex");

//user profile elements
let profileFirstName = document.getElementById("firstName");
let profileLastName = document.getElementById("lastName");
let profileBio = document.getElementById("bio");
let profileHeight = document.getElementById("height");
let profileWeight = document.getElementById("weight");
let profileGender = document.getElementsByName("gender");

//logout listener
signInButtonElement.addEventListener("click", signOut);

//update user data
userInfoSubmitButton.addEventListener("click", collectUserData);

//firestore references
const usersReference = firebase.firestore().collection("Users");

//firebase storage references
const storageRef = firebase.storage().ref();

// upload profile pic listener
var uploadImageFile = document.getElementById("profile-pic-file");
uploadImageFile.addEventListener("change", uploadProfilePic);

initFirebaseAuth();//upon loading check the auth status of the user

//execute anytime the user's authentication changes
function authStateObserver(user) {
  
    var user = firebase.auth().currentUser;//authentication observer that holds user details
    
    if (user) {//user successfully logged in
        
        getUserInfo();
        loadProfilePicture()
        loadUserProfile();

    } else {
      // No user is signed in.
      window.alert("Please login again.");
      //send the user to the login page
      window.location.href = "login.html";
    }

}

function loadUserProfile() {

    let gender = "";

    usersReference.doc(getUserId()).get()
    .then(function (querySnapshot) {
      if (querySnapshot.exists) {//verify the user is in the database
        //modify the html with the user's information
        profileFirstName.value = querySnapshot.data().firstname;
        profileLastName.value = querySnapshot.data().lastname;
        profileBio.value = querySnapshot.data().bio;
        profileHeight.value = querySnapshot.data().height;
        profileWeight.value = querySnapshot.data().weight;
        gender = querySnapshot.data().sex;

        for (let i = 0; i < profileGender.length; i++) {
            if (profileGender[i].value === gender) {
                profileGender[i].checked = true;
            }
        }

      }
    })
    .catch(function (error) {
      console.log("Error getting User information:", error);
    });

}

//gather all data entered by the user to create their profile
function collectUserData() {

    const id = getUserId();
    let fName = "";
    let lName = "";
  
    if (document.getElementById("firstName").value !== "") {//check field isn't empty
      const tempfName = document.getElementById("firstName").value;
      fName = tempfName.charAt(0).toUpperCase() + tempfName.slice(1).toLowerCase();
    }
  
    if (document.getElementById("lastName").value !== "") {//check field isn't empty
      const templName = document.getElementById("lastName").value;
      lName = templName.charAt(0).toUpperCase() + templName.slice(1).toLowerCase();
    }
  
    const fullName = fName.toLowerCase() + " " + lName.toLowerCase();
    let bio = "";
    let height = "";
    let weight = "";
  
    if (document.getElementById("bio").value !== "") {
      bio = document.getElementById("bio").value;
    }
  
    if (document.getElementById("height").value !== "") {
      height = document.getElementById("height").value;
    }
  
    if (document.getElementById("weight").value !== "") {
      weight = document.getElementById("weight").value;
    }
  
    const gender = document.getElementsByName("gender");
    var sex = 3;
    // get the value of the selected radio button
    for(var i = 0; i < gender.length; i++) {
      if(gender[i].checked)
      {
        sex = gender[i].value;
      }
    }
  
    //update the user in firestore
    updateUser(fName, lName, fullName, bio, height, weight, id, sex, profilePicture);
  
}

function updateUser(firstName, lastName, fullName, bio, height, weight, id, sex, profilePicture) {

    usersReference.doc(getUserId()).update( {
        firstname: firstName,
        lastname: lastName,
        fullname: fullName,
        bio: bio,
        height: height,
        weight: weight,
        id: id,
        sex: sex
    }).then(function() {//successfully update users information

        //reload input values
        loadUserProfile();

    }).catch(function() {//failed to update users information

    });

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
       collectProfilePicture(imageFile);
     }
}

function collectProfilePicture(profilePicture) {

  const profileRef = storageRef.child("profile/" + getUserId());//store with the users id
  profileRef.put(profilePicture).then(function () {
    //successfully uploaded the image
  }).catch(function() {
    console.log("Unable to upload profile picture");
  });

}

function loadProfilePicture() {
  const profileRef = storageRef.child("profile/" + getUserId());//load from the users id
  profileRef.getDownloadURL().then(function(url) {
    let profileAvatar = document.getElementById("avatar");//setup profile page
    profileAvatar.src = url;

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