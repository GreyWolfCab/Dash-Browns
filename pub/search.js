// get add & cancel request div elements
var addButtonContainer = document.getElementsByClassName("add-friend-container")[0];
var cancelRequestContainer = document.getElementsByClassName("cancel-request-container")[0];
var searchUserNameElement = document.getElementById("friend-name");
var friendDivElement = document.getElementsByClassName("friend")[0];

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
          friendDivElement.style.visibility = "hidden";
        }
        else{
          friendDivElement.style.visibility = "visible";
          console.log(doc.data().firstname, " => ", doc.data().id);
          console.log(getUserId());
          var dispName = doc.data().firstname + " " + doc.data().lastname;
          searchUserNameElement.textContent = dispName;
          friendFound = 1;  // friend is found, true
        }
      });
      if(friendFound === 0){  // friend is not found, false
        friendDivElement.style.visibility = "hidden";
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
  // TODO: add friend to user's pending friends list

}

function cancelFriendRequest() {
  changeCancelRequestOverlay();
  // TODO: remove friend from user's pending friends list
}