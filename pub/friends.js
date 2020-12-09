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
let profilePictureUrl = null;

//pending friends list
var pendingFriends = [];

initFirebaseAuth();//upon loading check the auth status of the user

// default tab that the user sees when the page first loads 
document.getElementById("defaultOpen").click();

function authStateObserver(user) {
  
  var user = firebase.auth().currentUser;//authentication observer that holds user details
  
  if (user) {//user successfully logged in

    getUserInfo();
    loadProfilePicture();
    loadFriends();
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

// function to switch tabs on friends page
function switchTab(event, tabName) {

  var i, tabcontent, tablinks;

  // hide div for activity, friends list, & pending friends list
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  
  // remove "active" class for all elements with class "tablinks"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // show current tab & add "active" class to button selected
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";

  switch(tabName) {
    case "pending-friends-list":
      loadPendingFriends();
      break;
    case "friends-list":
      loadFriends();
      break;
  }

}

function loadFriends() {

  document.getElementById("friends-list").innerHTML = "";
  pendingFriends = [];

  usersReference.doc(getUserId()).collection("FriendLists").get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(request) {
      
      const profileRef = storageRef.child("profile/" + request.data().friendID);//store with the friendLists's id
      profileRef.getDownloadURL().then(function(url) {
        
        drawFriend(new PendingFriend(url, request.data().friendID, request.data().friendFirstName, request.data().friendLastName));
      }).catch(function(error) {
        if (error.code === 'storage/object-not-found') {
          //profile picture not found
        }
      });
      
    });
    
  }).catch(function() {
    //could not pull any friend requests
  });

}

function drawFriend(friendInList) {

  var list = document.getElementById("friends-list");//list element to hold all pending friends
  list.appendChild(htmlFriend(friendInList));

}

function htmlFriend(friendInList) {

  let div = document.createElement("div");
  div.setAttribute("class", "friend");
  div.innerHTML = '<img class="friend-img" src="' + friendInList.requestPicture + '"/>' +
                  '<p class="friend-name"> ' + friendInList.firstName + ' ' + friendInList.lastName + '</p>' +
                  '<div class="friendsbtngroup">' +
                      '<div class="delete-btn" style=" margin-right:10px;">' +
                          '<button id="' + friendInList.id + '" onclick = "deleteFriend(this.id)" class="btn btn-sm btn-danger btn-block" type="submit" style="width:100px;"> <i class="fas fa-user-times"></i> Delete</button>' +
                      '</div>' +
                  '</div>';
  
  return div;

}


function loadPendingFriends() {

  document.getElementById("pending-friends-list").innerHTML = "";
  pendingFriends = [];

  usersReference.doc(getUserId()).collection("FriendRequests").get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(request) {
      
      const profileRef = storageRef.child("profile/" + request.id);//store with the friendRequest's id
      profileRef.getDownloadURL().then(function(url) {
        drawPendingFriend(new PendingFriend(url, request.id, request.data().requestedUserFirstName, request.data().requestedUserLastName));
      }).catch(function(error) {
        if (error.code === 'storage/object-not-found') {
          //profile picture not found
        }
      });
      
    });
    
  }).catch(function() {
    //could not pull any friend requests
  });

}

function drawPendingFriend(pendingFriend) {

  var list = document.getElementById("pending-friends-list");//list element to hold all pending friends
  list.appendChild(htmlPendingFriend(pendingFriend));

}

function htmlPendingFriend(pendingFriend) {

  let div = document.createElement("div");
  div.setAttribute("class", "friend");
  div.innerHTML = '<img class="friend-img" src="' + pendingFriend.requestPicture + '"/>' +
                  '<p class="friend-name"> ' + pendingFriend.firstName + ' ' + pendingFriend.lastName + '</p>' +
                  '<div class="friendsbtngroup">' +
                      '<div class="accept-friend-btn" style=" margin-right:10px;">' +
                          '<button id= "' + pendingFriend.id + '" onclick = "acceptFriend(this.id)" class="btn btn-sm btn-success btn-block" type="submit" style="width:100px; margin:0;"> <i class="fas fa-check"></i> Accept</button>' +
                      '</div>' +
                      '<div class="decline-friend-btn">' +
                          '<button id="' + pendingFriend.id + '" onclick = "declineFriend(this.id)" class="btn btn-sm btn-danger btn-block" type="submit" style="width:100px; margin:0;"> <i class="fas fa-times"></i> Decline</button>' +
                      '</div>' +
                  '</div>';
  
  return div;

}

function PendingFriend(requestPicture, id, firstName, lastName) {
  this.requestPicture = requestPicture;
  this.id = id;
  this.firstName = firstName;
  this.lastName = lastName;
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

function acceptFriend(acceptingFriendID){


  // adding the requested friend to the user's friend list
  usersReference.where('id', '==', acceptingFriendID).get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(friend) {
      // deleting the request from the pending list
      declineFriend(acceptingFriendID)
      // send friend request data to firestore 
      usersReference.doc(getUserId()).collection('FriendLists').doc(acceptingFriendID).set({
        friendID: acceptingFriendID,
        friendFirstName: friend.data().firstname,
        friendLastName: friend.data().lastname
        
      }).catch(function(error) {
        console.error('Error writing new friend request to firestore', error);
      });
    });
  })
  .catch(function(error) {
      console.log("Error getting documents: ", error);
  });

  // adding the user to the requested friend's friend list
  usersReference.doc(getUserId()).get()
  .then(function (userQuerySnapshot) {
    if (userQuerySnapshot.exists) {//verify the user is in the database
      //modify the html with the user's information
      // RequestedUserFirstName = userQuerySnapshot.data().firstname // user's name
      // RequestedUserLastName = userQuerySnapshot.data().lastname

      usersReference.where('id', '==', acceptingFriendID).get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          console.log(userQuerySnapshot.data().firstname + " is now friend with " + doc.data().firstname)

          // send friend request data to firestore 
          usersReference.doc(doc.data().id).collection("FriendLists").doc(getUserId()).set({
            friendID: getUserId(),
            friendFirstName: userQuerySnapshot.data().firstname,
            friendLastName: userQuerySnapshot.data().lastname
          }).catch(function(error) {
            console.error('Error writing new friend request to firestore', error);
          });
        });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });


    }
  })
  .catch(function (error) {
    console.log("Error getting User information:", error);
  });
}

function declineFriend(decliningFriendID){

  //get the data from friend request list associated with the searched user
  usersReference.doc(getUserId()).collection("FriendRequests").doc(decliningFriendID).delete()
  .then(function (querySnapshot) {
    console.log("Request successfully declined!");
    //send the user to the login page
    window.location.href = "friends.html";
  }).catch(function (error) {
    console.log("Error getting user's friend request list...");
  });

}



function deleteFriend(deletingFriendID){

  //get the data from friend request list associated with the searched user
  usersReference.doc(getUserId()).collection("FriendLists").doc(deletingFriendID).delete()
  .then(function (querySnapshot) {
    console.log("Friend successfully deleted!");
    //send the user to the login page
    window.location.href = "friends.html";
  }).catch(function (error) {
    console.log("Error getting user's friend request list...");
  });

}

// Initiate Firebase Auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's ID.
function getUserId() {
  return firebase.auth().currentUser.uid;
}

// Signs-out of Dash Browns.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}