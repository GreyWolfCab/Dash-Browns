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

//firebase storage references
const storageRef = firebase.storage().ref();

//stores activity images
let uploadImageFile = null;
let activityImage = null;

let profilePictureUrl = null;

initFirebaseAuth();//upon loading check the auth status of the user

var activitiesList = [];//empty list of user activities

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

/**
 * TODO: include type and privacy of activity
 * build an html object of an activity to add in a unordered list and present to the user
 * @param {Activity} activity object that stores a single activity's data
 */
function htmlActivity(activity) {
  
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
                    '<img src="' + profilePictureUrl + '" width="50px" height="50px" style="float: left; margin: 5px 0px 0px 5px">' +
                    '<p id="user-fullname">' + activity.userName + iHTML + '</p>' +
                    '<p class="date">' + activity.date.toDate() + '</p>'+
                    '<img src="' + url + '" alt="activity icon" class="activity-img" width="400px" height="200px">' +
                    '<p class="caption">' + activity.caption + '</p>' +
                    '<div class="toggles">' +
                      '<i class="far fa-heart"></i> <p id="heartCount">' + activity.likes + '</p>' +
                      '<i class="far fa-comment"></i> <p id="cmtCount">0</p>' +
                    '</div>'

  }).catch(function(error) {
    
    li.innerHTML = '<div class="activity">' +
                    '<img src="' + profilePictureUrl + '" width="50px" height="50px" style="float: left; margin: 5px 0px 0px 5px">' +
                    '<p id="user-fullname">' + activity.userName + iHTML + '</p>' +
                    '<p class="date">' + activity.date.toDate() + '</p>'+
                    '<img src="Resources/weight-lifting.jpg" alt="activity icon" class="activity-img" width="400px" height="200px">' +
                    '<p class="caption">' + activity.caption + '</p>' +
                    '<div class="toggles">' +
                      '<i class="far fa-heart"></i> <p id="heartCount">' + activity.likes + '</p>' +
                      '<i class="far fa-comment"></i> <p id="cmtCount">0</p>' +
                    '</div>'

  });

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
      activitiesList.push(new Activity(doc.id, doc.data().caption, getUserId(), userName, doc.data().type, doc.data().likes, doc.data().isPrivate, doc.data().date));
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
      userGreetingElement.textContent = querySnapshot.data().firstname;
    }
  })
  .catch(function (error) {
    console.log("Error getting User information:", error);
  });

}

//store a user's activity to easily access it, based on firestore collection of activities
function Activity(id, caption, userId, userName, type, likes, isPrivate, date) {
  this.id = id;
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
                      '<img id="activityImage" src="Resources/weight-lifting.jpg" width="400px" height="200px">' +
                      '<div class="upload-activity-wrapper">' +
                        '<button id="upload-btn" class="btn btn-primary btn-sm"><i class="far fa-file-image"></i> Upload Image</button>' +
                        '<input type="file" accept="image/png" name="activity-pic" id="activity-pic-file"/>' +
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

  // upload profile pic listener
  uploadImageFile = document.getElementById("activity-pic-file");
  uploadImageFile.addEventListener("change", uploadActivityPic);

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
    createWeightActivity(type, postTitle, postSets, postReps, caption, isPrivate);
  }

}

function createWeightActivity(type, postTitle, postSets, postReps, caption, isPrivate) {

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
  }).then(function(doc) {
    if (activityImage !== null) {
      collectActivityPicture(doc.id);
    }
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
  }).then(function(doc) {
    if (activityImage !== null) {
      collectActivityPicture(doc.id);
    }
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
  }).then(function(doc) {
    if (activityImage !== null) {
      collectActivityPicture(doc.id);
    }
    loadUserActivities();
    changeOverlay();
  }).catch(function(error) {
    console.error('Error writing new activity to firestore', error);
  });

}

function loadProfilePicture() {
  const profileRef = storageRef.child("profile/" + getUserId());//load from the users id
  profileRef.getDownloadURL().then(function(url) {
    profilePictureUrl = url;
    let profilePicture = document.getElementById("profilePicture");//setup profile picture in navbar
    profilePicture.src = url;
  }).catch(function(error) {
    if (error.code === 'storage/object-not-found') {
      //profile picture not found
    }
  });
}

// displays uploaded profile picture
function uploadActivityPic() {
  
  var imageFile = uploadImageFile.files[0];
  // check file size
   if(imageFile.size > (2 * 1024 * 1024)) // 2MB file size limit for a user icon
   {
     alert("Image file size cannot exceed 2MB");
   }
   // change avatar img src to image user uploaded
   else 
   {
     var activityAvatar = document.getElementById("activityImage");
     // sets avatar image src 
     activityAvatar.src = URL.createObjectURL(imageFile);
     activityImage = imageFile;
   }
}

function collectActivityPicture(activityId) {

  const activityRef = storageRef.child("activity/" + activityId);//store with the activity's id
  activityRef.put(activityImage).then(function () {
    //successfully uploaded the image
  }).catch(function() {
    console.log("Unable to upload activity picture");
  });

  activityImage = null;

}

function loadActivityImage(activityId) {
  let image = null;
  const activityRef = storageRef.child("activity/" + activityId);//store with the activity's id
  activityRef.getDownloadURL().then(function(url) {
    image = url;
  }).catch(function(error) {
    if (error.code === 'storage/object-not-found') {
      //profile picture not found
    }
  });
  return image;
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
