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

        // do validation

        // send to firestore
        firebase.firestore().collection('profiles').doc(user.getUid()).set({
          firstname: firstname,
          lastname: lastname,
          bio: bio,
          height: height,
          weight: weight,
          sex: sex,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(function(error) {
          console.error('Error writing new message to database', error);
        });

    } else {
        // how did they make it here without being logged in
    }
}