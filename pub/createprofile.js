initFirebaseAuth();//upon loading check the auth status of the user

function authStateObserver(user) {
  
  var user = firebase.auth().currentUser;//authentication observer that holds user details

  if (user) {
    // User is signed in.
    window.alert("Welcome back, " + user.displayName + "!");   // set pop up to see if it's getting here.

  } else {
    // No user is signed in.
  }
}