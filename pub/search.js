// get add & cancel request div elements
var addButtonContainer = document.getElementsByClassName("add-friend-container")[0];
var cancelRequestContainer = document.getElementsByClassName("cancel-request-container")[0];

// event listener for add & cancel request
addButtonContainer.addEventListener("click", addFriend);
cancelRequestContainer.addEventListener("click", cancelFriendRequest);

// search users 
function searchUser() {
    var input = document.getElementById("searchInput").value;
    document.getElementById("results-list").style.display = "block";
    document.getElementsByClassName("activity-header")[0].style.display = 'none';
    document.getElementsByClassName("activities")[0].style.display = 'none';
    document.getElementsByClassName("activity-title")[0].style.display = 'none';
    
    // TODO: Retrieve user from firebase
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