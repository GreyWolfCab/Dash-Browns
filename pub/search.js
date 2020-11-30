// get add & cancel request div elements
var addButtonContainer = document.getElementsByClassName("add-friend-container")[0];
var cancelRequestContainer = document.getElementsByClassName("cancel-request-container")[0];
var searchUserNameElement = document.getElementsByClassName("searched-friend-name")[0];
var friendDivElement = document.getElementsByClassName("searched-friend")[0];

// event listener for add & cancel request
addButtonContainer.addEventListener("click", addFriend);
cancelRequestContainer.addEventListener("click", cancelFriendRequest);

// search users 
function searchUser() {

    var input = document.getElementById("searchInput").value;
    var friendFound = 0; // using as a boolean

    usersReference.where('fullname', '==', input.toLowerCase()).get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {

        if(doc.data().id === getUserId()){
          friendDivElement.style.display = "none";
        }
        else{
          friendDivElement.style.display = "flex";
          // console.log(doc.data().firstname, " => ", doc.data().id);
          // console.log(getUserId());
          var dispName = doc.data().firstname + " " + doc.data().lastname;
          searchUserNameElement.textContent = dispName;
          friendFound = 1;  // friend is found, true

          //get the data from friend request list associated with the searched user
          usersReference.doc(doc.data().id).collection("FriendRequests").get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function(docdoc) {
              if(docdoc.data().RequestUserID == getUserId()){
                addButtonContainer.style.display = "none";
                cancelRequestContainer.style.display = "block";
              }
              else{
                addButtonContainer.style.display = "block";
                cancelRequestContainer.style.display = "none";
              }
            });
          }).catch(function (error) {
            console.log("Error getting user's friend request list...");
          });
        }
      });
      if(friendFound === 0){  // friend is not found, false
        friendDivElement.style.display = "none";
      }
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

    document.getElementById("results-list").style.display = "block";
    document.getElementsByClassName("main-container")[0].style.display = 'none';
    
}

// change add button to cancel request
function changeAddOverlay() {
  if(cancelRequestContainer.style.display === "none")
  {
    addButtonContainer.style.display = "none";
    cancelRequestContainer.style.display = "block";
  }
  else
  {
    cancelRequestContainer.style.display = "none";
  }
}

// change cancel request button to add 
function changeCancelRequestOverlay() {
  if(addButtonContainer.style.display === "none")
  {
    addButtonContainer.style.display = "block";
    cancelRequestContainer.style.display = "none";
  }
  else
  {
    addButtonContainer.style.display = "none";
  }
}

function addFriend() {
  alert("Friend request sent!")
  changeAddOverlay();

  var input = document.getElementById("searchInput").value;

  usersReference.where('fullname', '==', input.toLowerCase()).get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log(getUserId(), " sent request to ", doc.data().firstname)

      // send friend request data to firestore 
      usersReference.doc(doc.data().id).collection('FriendRequests').doc(getUserId()).set({
        RequestUserID: getUserId()
      }).catch(function(error) {
        console.error('Error writing new friend request to firestore', error);
      });
    });
  })
  .catch(function(error) {
      console.log("Error getting documents: ", error);
  });
}

function cancelFriendRequest() {
  changeCancelRequestOverlay();
  
  var input = document.getElementById("searchInput").value;

  usersReference.where('fullname', '==', input.toLowerCase()).get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {

      //get the data from friend request list associated with the searched user
      usersReference.doc(doc.data().id).collection("FriendRequests").doc(getUserId()).delete()
      .then(function (querySnapshot) {
        console.log("Request successfully deleted!");
        
      }).catch(function (error) {
        console.log("Error getting user's friend request list...");
      });
    
    });
  })
  .catch(function(error) {
      console.log("Error getting request documents: ", error);
  });
}

// Returns the signed-in user's ID.
function getUserId() {
  return firebase.auth().currentUser.uid;
}