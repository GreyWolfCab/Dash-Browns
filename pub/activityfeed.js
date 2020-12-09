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

//activities variables
let activitiesList = [];

let friendsList = [];

initFirebaseAuth();//upon loading check the auth status of the user

//execute anytime the user's authentication changes
function authStateObserver(user) {
  
    var user = firebase.auth().currentUser;//authentication observer that holds user details
    
    if (user) {//user successfully logged in
        
        getUserInfo();
        loadProfilePicture();
        loadUserActivities();

    } else {
      // No user is signed in.
      window.alert("Please login again.");
      //send the user to the login page
      window.location.href = "login.html";
    }

}

//collect the necessary data for each activity owned by a user
function loadUserActivities() {

  friendsList = [];//friends associated with the current user
  usersReference.doc(getUserId()).collection("FriendLists").get()
  .then(function(friendDocs) {
      
    //empty activities list
    document.getElementById("activityList").innerHTML = "";
    activitiesList = [];

    friendDocs.forEach(function(friend) {//go through every friend belonging to the current user

      let userName = friend.data().friendFirstName + " " + friend.data().friendLastName;
      friendsList.push(friend.id);
      //get the data from every activity associated with the current friend
      usersReference.doc(friend.id).collection("Activities").get()
      .then(function(activityDocs) {
        activityDocs.forEach(function(doc) {//go through every activity belonging to the friend

          let stat1;
          let stat2;
          let stat3;
          switch(doc.data().type) {
            case "weightLifting": 
              stat1 = doc.data().title;
              stat2 = doc.data().sets;
              stat3 = doc.data().reps;
              break;
            case "swimming":
              stat1 = doc.data().time;
              stat2 = doc.data().laps;
              stat3 = doc.data().distance;
              break;
            case "running":
            case "hiking":
            case "biking":
            case "walking":
            default:
              stat1 = doc.data().time;
              stat2 = doc.data().distance;
              stat3 = doc.data().calories;
              break;

          }

          //add each user activity to a list
          drawActivities(new Activity(doc.id, doc.data().caption, friend.id, userName, doc.data().type, doc.data().likes,
                                          doc.data().isPrivate, doc.data().date, stat1, stat2, stat3));
        });
        
      }).then(function() {
        
        loadFriendPictures();

      }).catch(function(error) {
        console.log("Error getting user activities...");
      });

    });

  }).catch(function(error){
    console.log("Error getting friends");
  });

}

//draws all the activites from a user into a list element 
function drawActivities(activity) {

  activitiesList.push(activity);
  activitiesList.sort(compareByDate);
  var list = document.getElementById("activityList");//list element to hold all activities
  list.appendChild(htmlActivity(activity))//add a single activity to the list element

}

/**
 * build an html object of an activity to add in a unordered list and present to the user
 * @param {Activity} activity object that stores a single activity's data
 */
function htmlActivity(activity) {

  let activityStatsHTML;
  switch(activity.type) {
    case "weightLifting":
      activityStatsHTML = '<p>Title: ' + activity.stat1 + '</p>' +
                          '<p>Sets: ' + activity.stat2 + '</p>' +
                          '<p>Reps: ' + activity.stat3 + '</p>';
      break;
    case "swimming":
      activityStatsHTML = '<p>Time: ' + activity.stat1 + '</p>' +
                          '<p>Laps: ' + activity.stat2 + '</p>' +
                          '<p>Distance: ' + activity.stat3 + '</p>';
      break;
    case "running":
    case "hiking":
    case "biking":
    case "walking":
    default:
      activityStatsHTML = '<p>Time: ' + activity.stat1 + '</p>' +
                          '<p>Distance: ' + activity.stat2 + '</p>' +
                          '<p>Calories: ' + activity.stat3 + '</p>';
      break;

  }

  let iHTML;
  switch(activity.type) {
    case "weightLifting": 
      iHTML = '<i class="fas fa-dumbbell fa-2x"></i>';
      break;
    case "swimming":  
      iHTML = '<i class="fas fa-swimmer fa-2x"></i>';
      break;
    case "running":
      iHTML = '<i class="fas fa-running fa-2x"></i>';
      break;
    case "hiking":
      iHTML = '<i class="fas fa-hiking fa-2x"></i>';
      break;
    case "biking":
      iHTML = '<i class="fas fa-biking fa-2x"></i>';
      break;
    case "walking":
    default:
      iHTML = '<i class="fas fa-walking fa-2x"></i>';
      break;

  }

  let li = document.createElement("li");

  const activityRef = storageRef.child("activity/" + activity.id);//store with the activity's id
  activityRef.getDownloadURL().then(function(url) {

    li.innerHTML = '<div class="activity">' +
                    '<img class="' + activity.userId + '" src="" width="50px" height="50px" style="float: left; margin: 5px 0px 0px 5px">' +
                    '<p id="user-fullname">' + activity.userName + iHTML + '</p>' +
                    '<p class="date">' + activity.date.toDate() + '</p>'+
                    '<div class="activity-details">' +
                      '<img src="' + url + '" alt="activity icon" class="activity-img" width="400px" height="200px">' +
                      '<div class="activity-stats">' +
                        activityStatsHTML +
                      '</div>' +
                    '</div>' +
                    '<p class="caption">' + activity.caption + '</p>' +
                    '<div class="toggles">' +
                      '<button type="button" id="like-button" onclick="likePost()"><i class="far fa-heart" id="heart"></i></button> <p id="heartCount">' + activity.likes + '</p>' +
                    '</div>'

  }).catch(function(error) {
    
    li.innerHTML = '<div class="activity">' +
                    '<img class="' + activity.userId + '" src="" width="50px" height="50px" style="float: left; margin: 5px 0px 0px 5px">' +
                    '<p id="user-fullname">' + activity.userName + iHTML + '</p>' +
                    '<p class="date">' + activity.date.toDate() + '</p>'+
                    '<div class="activity-details">' +
                      '<img src="Resources/weight-lifting.jpg" alt="activity icon" class="activity-img">' +
                      '<div class="activity-stats">' +
                        activityStatsHTML +
                      '</div>' +
                    '</div>' +
                    '<p class="caption">' + activity.caption + '</p>' +
                    '<div class="toggles">' +
                      '<button type="button" id="like-button" onclick="likePost()"><i class="far fa-heart" id="heart"></i></button> <p id="heartCount">' + activity.likes + '</p>' +
                    '</div>'

  });

  return li;         
                
}

function loadFriendPictures() {

  for (let i = 0; i < friendsList.length; i++) {

    let currentFriend = friendsList[i];
    let friendImg = document.getElementsByClassName(currentFriend);

    const profileRef = storageRef.child("profile/" + currentFriend);//store with the activity's id
    profileRef.getDownloadURL().then(function(url) {
      for (let img of friendImg) {
        img.setAttribute("src", url);
      }
    }).catch(function(error) {
      if (error.code === 'storage/object-not-found') {
        //profile picture not found
      }
    });

  }
}

//store a user's activity to easily access it, based on firestore collection of activities
function Activity(id, caption, userId, userName, type, likes, isPrivate, date, stat1, stat2, stat3) {
  this.id = id;
  this.caption = caption;
  this.userId = userId;
  this.userName = userName;
  this.type = type;
  this.stat1 = stat1;
  this.stat2 = stat2;
  this.stat3 = stat3;
  this.likes = likes;
  this.isPrivate = isPrivate;
  this.date = date;

}

function compareByDate(a, b) {
  return -(a.date - b.date);//in descending order
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