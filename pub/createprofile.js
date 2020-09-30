initFirebaseAuth();//upon loading check the auth status of the user

function authStateObserver(user) {
  
  var user = firebase.auth().currentUser;//authentication observer that holds user details

  if (user) {
    // User is signed in.
    //window.alert("Welcome back, " + user.displayName + "!");   // set pop up to see if it's getting here.

  } else {
    // No user is signed in.
  }
}

function createProfile() {
    var user = firebase.auth().currentUser;
    if (user) {
        // Get data from html
        var firstname = "";
        var lastname = "";
        var bio = "";
        var height = "";
        var weight = "";
        var sex = "";

        // stick data into json

        // do validation

        // send to firestore

    } else {
        // how did they make it here without being logged in
    }
}