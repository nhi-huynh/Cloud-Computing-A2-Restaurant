var firstTime = true;

// Authentication using Google OAuth
function onSignIn(googleUser) {

  var profile = googleUser.getBasicProfile();
  // var user_id = profile.getId();
  console.log("User logged in");

  //Reset localStorage to store fresh details of the logged in user
  var cart_data = {};

  cart_data["time"] = Date.now();
  cart_data["user_email"] = profile.getEmail();
  cart_data["user_name"] = profile.getName();
  cart_data["dishes"] = [];
  cart_data["total_cost"] = 0;
  cart_data["delivery_address"] = "";
  cart_data["delivery_method"] = "";

  localStorage.setItem('cart_data', JSON.stringify(cart_data));

  console.log("Add user to cart_data");
  console.log(cart_data);

  // Redirect the user to the menu page if they log in for the first time
  if (firstTime){
    window.location= '/menu'; 
    console.log("Welcome " + profile.getName +" to the menu page!");
    firstTime = false;
  }
  
}

// Sign out using Google OAuth 
function signOut() {
  
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });

  //Reset localStorage to prepare for a new user
  localStorage.clear();

  // Redirect the user to the index page
  var url= "/"; 
  window.location.href = url; 
}

// In case signOut is on separate page, you should manually load and init gapi.auth2 library.
function onLoad() {
  gapi.load('auth2', function() {
    gapi.auth2.init();
  });
}