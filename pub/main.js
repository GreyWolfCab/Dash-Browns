"use strict";

var createAccountButtonElement = document.getElementById("create-account");
var userInfoSubmitButton = document.getElementById("user-info-submit");

var userOverlayDivElement = document.getElementsByClassName("user-overlay")[0];

createAccountButtonElement.addEventListener("click", changeOverlay);
userInfoSubmitButton.addEventListener("click", changeOverlay);



function changeOverlay() {
    if (userOverlayDivElement.style.display === "none") {
        userOverlayDivElement.style.display = "block";
    } else {
        userOverlayDivElement.style.display = "none";

        const email = document.getElementById("emailInput").value;
        const password = document.getElementById("passwordInput").value;

        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            // [START_EXCLUDE]
            if (errorCode == 'auth/weak-password') {
              alert('The password is too weak.');
            } else {
              alert(errorMessage);
            }
            console.log(error);
            // [END_EXCLUDE]

          });

        console.log('account created for ' + fName);

        // I'm going to try to initialize below info for the active user : Aimi =====================10/03
        const fName = document.getElementById("firstName").value;
        const lName = document.getElementById("lastName").value;
        const bio = document.getElementById("bio").value;
        const height = document.getElementById("height").value;
        const weight = document.getElementById("weight").value;
        const gender = document.getElementsByName("gender");
        // get the value of the selected radio button
        for(var i = 0; i < gender.length; i++) {
          if(gender[i].checked)
          {
            const sex = gender[i].value;
          }
        }
        
        

        
    }
}