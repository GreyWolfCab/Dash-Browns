
// default tab that the user sees when the page first loads 
document.getElementById("defaultOpen").click();

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
}
