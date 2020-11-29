"use strict";

//firebase DOM elements
var signInButtonElement = document.getElementById("logout");

//user referential elements
var userNameElement = document.getElementById("user-fullname");
var userWeightElement = document.getElementById("user-weight");
var userHeightElement = document.getElementById("user-height");
var userSexElement = document.getElementById("user-sex");
var userGreetingElement = document.getElementById("firstName");

//activity elements
var activityOverlayDivElement = document.getElementsByClassName("input-overlay")[0];

var weightLiftingButton = document.getElementById("weight-lifting-act");
var swimmingButton = document.getElementById("swimming-act");
var runningButton = document.getElementById("running-act");
var hikingButton = document.getElementById("hiking-act");
var bikingButton = document.getElementById("biking-act");
var walkingButton = document.getElementById("walking-act");

weightLiftingButton.addEventListener("click", function() {
  postActivity("weightLifting");
});

swimmingButton.addEventListener("click", function() {
  postActivity("swimming");
});

runningButton.addEventListener("click", function() {
  postActivity("running");
});

hikingButton.addEventListener("click", function() {
  postActivity("hiking");
});

bikingButton.addEventListener("click", function() {
  postActivity("biking");
});

walkingButton.addEventListener("click", function() {
  postActivity("walking");
});

//exit out of activity overlay
document.addEventListener("click", function(event) {
  if (event.target.getAttribute("class") == "input-overlay") {
    changeOverlay();
  }
});

//logout listener
signInButtonElement.addEventListener("click", signOut);

//firestore references
const usersReference = firebase.firestore().collection("Users");
const activitiesReference = firebase.firestore().collection("Activities");

initFirebaseAuth();//upon loading check the auth status of the user

var activitiesList = [];//empty list of user activities

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
                    '<p class="caption"><b>' + activity.type + ': </b>' + activity.caption + '</p>' +
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

  //empty activities list
  document.getElementById("activityList").innerHTML = "";
  activitiesList = [];

  //get the data from every activity associated with the current user
  usersReference.doc(getUserId()).collection("Activities").orderBy("date", "desc").get()
  .then(function (querySnapshot) {
    querySnapshot.forEach(function(doc) {//go through every activity belonging to the user
      //add each user activity to a list
      activitiesList.push(new Activity(doc.data().caption, getUserId(), userName, doc.data().type, doc.data().likes, doc.data().isPrivate, doc.data().date));
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
function Activity(caption, userId, userName, type, likes, isPrivate, date) {

  this.caption = caption;
  this.userId = userId;
  this.userName = userName;
  this.type = type;
  this.likes = likes;
  this.isPrivate = isPrivate;
  this.date = date;

}

let cardioActivityHTML = '<div class="time-container">' +
                          '<label for="postTime" style="font-weight: bold;">Time: (Minutes)</label>' +
                          '<input type="text" id="postTime" class="form-control">' +
                        '</div>' +
                        '<div class="distance-container">' +
                          '<label for="postDistance" style="font-weight: bold;">Distance: (Miles)</label>' +
                          '<input type="text" id="postDistance" class="form-control">' +
                        '</div>' +
                        '<div class="calories-container">' +
                          '<label for="postCalories" style="font-weight: bold;">Calories: </label>' +
                          '<input type="text" id="postCalories" class="form-control">' +
                        '</div>';

let weightActivityHTML = '<div class="title-container">' +
                          '<label for="postTitle" style="font-weight: bold;">Title: </label>' +
                          '<input type="text" id="postTitle" class="form-control">' +
                        '</div>' +
                        '<div class="sets-container">' +
                          '<label for="postSets" style="font-weight: bold;">Sets: </label>' +
                          '<input type="number" id="postSets" class="form-control">' +
                        '</div>' +
                        '<div class="reps-container">' +
                          '<label for="postReps" style="font-weight: bold;">Reps: </label>' +
                          '<input type="number" id="postReps" class="form-control">' +
                        '</div>';

let swimmingActivityHTML = '<div class="time-container">' +
                          '<label for="postTime" style="font-weight: bold;">Time: (Minutes)</label>' +
                          '<input type="text" id="postTime" class="form-control">' +
                        '</div>' +
                        '<div class="laps-container">' +
                          '<label for="postLaps" style="font-weight: bold;">Laps: </label>' +
                          '<input type="number" id="postLaps" class="form-control">' +
                        '</div>' +
                        '<div class="distance-container">' +
                          '<label for="postDistance" style="font-weight: bold;">Distance: (Miles)</label>' +
                          '<input type="text" id="postDistance" class="form-control">' +
                        '</div>';

function changeOverlay() {
  if (activityOverlayDivElement.style.display === "none") {
      activityOverlayDivElement.style.display = "block";
  } else {
      activityOverlayDivElement.style.display = "none";
  }
}

function postActivity(type) {

  let activityHTML;
  switch(type) {
    case "weightLifting": activityHTML = weightActivityHTML;
                          break;
    case "swimming":  activityHTML = swimmingActivityHTML;
                      break;
    case "running":
    case "hiking":
    case "biking":
    case "walking":
    default:  activityHTML = cardioActivityHTML;
              break;

  }

  var div = document.createElement("div");
  div.setAttribute("id", type);
  div.setAttribute("class", "post-container");

  div.innerHTML = "<h2>Post an activity</h2>" +
                    '<div class="upload-profileimg">' +
                      '<div class="upload-profile-wrapper">' +
                      '<button id="upload-btn" class="btn btn-primary btn-sm"><i class="far fa-file-image"></i> Upload Image</button>' +
                      '<input type="file" accept="image/png" name="profile-pic" id="profile-pic-file"/>' +
                      '</div>' +
                    '</div>' +
                    '<div class="post-info-container">' +
                        activityHTML +
                        '<div class="caption-container">' +
                            '<label for="postCaption" style="font-weight: bold;">Caption: </label>' +
                            '</br>' +
                            '<textarea id="postCaption" cols="50%" rows="4"></textarea>' +
                        '</div>' +

                        '<div class="privacy-toggle">' +
                            '<label class="switch">' +
                                '<input id="postPrivate" type="checkbox">' +
                                'Public' +
                                '<span class="slider round"></span>' +
                            'Private' +
                            '</label>' +
                        '</div>' +
                        
                        '<div class="post-button">' +
                            '<button onClick="collectActivityData()" type="button" id="btns" id="post-act-btn" style="width: 250px; margin-top: 0em; float:right;" class="btn btn-lg btn-success"> Post</button>' +
                        '</div>' +
                    '</div>';

  activityOverlayDivElement.innerHTML = "";
  activityOverlayDivElement.appendChild(div);
  changeOverlay();

}

function collectActivityData() {

  let type = document.getElementsByClassName("post-container")[0].getAttribute("id");
  let caption = document.getElementById("postCaption").value;
  let isPrivate = document.getElementById("postPrivate").checked;

  if (document.getElementById("postLaps") !== null) {
    let postTime = document.getElementById("postTime").value;
    let postLaps = document.getElementById("postLaps").value;
    let postDistance = document.getElementById("postDistance").value;
    createSwimActivity(type, postTime, postLaps, postDistance, caption, isPrivate);
  } else if (document.getElementById("postTime") !== null) {
    let postTime = document.getElementById("postTime").value;
    let postDistance = document.getElementById("postDistance").value;
    let postCalories = document.getElementById("postCalories").value;
    createCardioActivity(type, postTime, postDistance, postCalories, caption, isPrivate);
  } else if (document.getElementById("postSets") !== null) {
    let postTitle = document.getElementById("postTitle").value;
    let postSets = document.getElementById("postSets").value;
    let postReps = document.getElementById("postReps").value;
    createWeigthActivity(type, postTitle, postSets, postReps, caption, isPrivate);
  }

}

function createWeigthActivity(type, postTitle, postSets, postReps, caption, isPrivate) {

  // send to firestore
  firebase.firestore().collection('Users').doc(getUserId()).collection('Activities').add({
    type: type,
    title: postTitle,
    sets: postSets,
    reps: postReps,
    caption: caption,
    isPrivate: isPrivate,
    likes: 0,
    date: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    loadUserActivities();
    changeOverlay();
  }).catch(function(error) {
    console.error('Error writing new activity to firestore', error);
  });

}

function createCardioActivity(type, postTime, postDistance, postCalories, caption, isPrivate) {

  // send to firestore
  firebase.firestore().collection('Users').doc(getUserId()).collection('Activities').add({
    type: type,
    time: postTime,
    calories: postCalories,
    distance: postDistance,
    caption: caption,
    isPrivate: isPrivate,
    likes: 0,
    date: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    loadUserActivities();
    changeOverlay();
  }).catch(function(error) {
    console.error('Error writing new activity to firestore', error);
  });

}

function createSwimActivity(type, postTime, postLaps, postDistance, caption, isPrivate) {
  
  // send to firestore
  firebase.firestore().collection('Users').doc(getUserId()).collection('Activities').add({
    type: type,
    time: postTime,
    laps: postLaps,
    distance: postDistance,
    caption: caption,
    isPrivate: isPrivate,
    likes: 0,
    date: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    loadUserActivities();
    changeOverlay();
  }).catch(function(error) {
    console.error('Error writing new activity to firestore', error);
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
