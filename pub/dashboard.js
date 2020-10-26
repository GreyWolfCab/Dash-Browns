"use strict";

//firebase DOM elements
var signInButtonElement = document.getElementById("logout");

//user referential elements
var userNameElement = document.getElementById("user-fullname");
var userWeightElement = document.getElementById("user-weight");
var userHeightElement = document.getElementById("user-height");
var userSexElement = document.getElementById("user-sex");
var userGreetingElement = document.getElementById("firstName");

//login listener
signInButtonElement.addEventListener("click", signOut);

//firestore references
const usersReference = firebase.firestore().collection("Users");
const activitiesReference = firebase.firestore().collection("Activities");

initFirebaseAuth();//upon loading check the auth status of the user

var activitiesList = [];

function authStateObserver(user) {
  
  var user = firebase.auth().currentUser;//authentication observer that holds user details
  
  if (user) {//user successfully logged in

    getUserInfo();
    loadUserActivities();

  } else {
    // No user is signed in.
    window.alert("Please login again.");
    //send the user to the login page
    window.location.href = "login.html";
  }
}

/**
 * TODO: include type and privacy of activity
 * build an html object of an activity to add in a unordered list and present to the user
 * @param {Activity} activity object that stores a single activity's data
 */
function htmlActivity(activity) {
  
  var li = document.createElement("li");
  li.innerHTML = '<div class="activity">' +
                    '<img src="Resources/mscott-ph.png" width="50px" height="50px" style="float: left; margin: 5px 0px 0px 5px">' +
                    '<p id="user-fullname" style="font-size: 15px; font-weight: bolder;">' + activity.userName + '<i class="fas fa-dumbbell fa-2x" style="float: right; color:#3CA9E3; margin: 5px 5px 0px 0px;"></i></p>' +
                    '<p class="date" style="font-size:10px; color: gray; margin-top: 0em;">' + activity.date.toDate() + '</p>'+
                    '<img src="Resources/weight-lifting.jpg" alt="activity icon" class="activity-img" width="400px" height="200px">' +
                    '<p class="caption">' + activity.title + '</p>' +
                    '<div class="toggles">' +
                      '<i class="far fa-heart"></i> <p id="heartCount">' + activity.likes + '</p>' +
                      '<i class="far fa-comment"></i> <p id="cmtCount">0</p>' +
                    '</div>'
  return li;         
                
}

//draws all the activites from a user into a list element 
function drawActivities() {

  var list = document.getElementById("activityList");//list element to hold all activities

  for (var i = 0; i < activitiesList.length; i++) {
    list.appendChild(htmlActivity(activitiesList[i]))//add a single activity to the list element
  }

}

//collect the necessary data for each activity owned by a user
function loadUserActivities() {

  var userName = "";//username associated with the activity
  usersReference.doc(getUserId()).get()
  .then(function(doc) {
    if (doc.exists) {
      userName = doc.data().firstname + " " + doc.data().lastname;
    }
  }).catch(function(error){
    console.log("Error getting user name");
  });

  //get the data from every activity associated with the current user
  usersReference.doc(getUserId()).collection("Activities").get()
  .then(function (querySnapshot) {
    querySnapshot.forEach(function(doc) {//go through every activity belonging to the user
      //add each user activity to a list
      activitiesList.push(new Activity(doc.data().title, getUserId(), userName, doc.data().type, doc.data().likes, doc.data().isPrivate, doc.data().date));
    });
    drawActivities();//draw every activity in html for the user
  }).catch(function (error) {
    console.log("Error getting user activities...");
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
      userGreetingElement.textContent = querySnapshot.data().firstname + ",";
    }
  })
  .catch(function (error) {
    console.log("Error getting User information:", error);
  });

}

//store a user's activity to easily access it, based on firestore collection of activities
function Activity(title, userId, userName, type, likes, isPrivate, date) {

  this.title = title;
  this.userId = userId;
  this.userName = userName;
  this.type = type;
  this.likes = likes;
  this.isPrivate = isPrivate;
  this.date = date;

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
