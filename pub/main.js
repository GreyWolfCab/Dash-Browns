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
    }
}

