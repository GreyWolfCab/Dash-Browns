firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    window.alert("Welcome back, " + userEmail + "!");   // set pop up to see if it's getting here.
    
    uid = user.uid;
    var user = firebase.auth().currentUser;

    if(user != null){
        
        var email_id = user.email;

    }

    // window.location.href = "profile.html";


  } else {
    // No user is signed in.
    window.alert("Please enter your email and password to login.");  // set pop up to see if it's getting here.
    // window.location.replace("index.html");
  }
});

// Signs-in Dash Browns.
function login() {
  
	var userEmail = document.getElementById("emailInput").value;
	var userPassword = document.getElementById("passwordInput").value;

    // window.alert("Calling login() function with " + userEmail + "!");
    
    // firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).catch(function(error)
    // firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error)
    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
        .then(function(firebaseUser) {
            // Success 
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            
            window.alert("Error: " + errorMessage);
        });

}

// Signs-out of Dash Browns.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate Firebase Auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}
