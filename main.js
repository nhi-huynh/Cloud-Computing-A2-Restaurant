// env_variables:
//   BUCKET_NAME: "example-gcs-bucket"



// Store user details
var user_id, user_name;
var user_email = "uyennhi.huynhluu@gmail.com";  //hard-coded to test features. Supposed to be read from the Google profile.

// Authentication using Google OAuth
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    user_id = profile.getId();
    user_name = profile.getName();
    user_email = profile.getEmail();

    document.getElementById("requestLogin").innerHTML = "Hi " + user_name + "! What would you like to eat today?";
    
    // Show all dishes in the menu
    fetchDishes();
  }

// Sign out using Google OAuth 
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');

  });
  document.getElementById("name").style.display = "none";
  document.getElementById("menu").style.display = "none";
  document.getElementById("requestLogin").innerHTML = "Login to order some yummy food!";
}



// Access to AWS DynamoDB 
AWS.config.update({
  region: "ap-southeast-2",
  endpoint: "https://dynamodb.ap-southeast-2.amazonaws.com",
  accessKeyId: "AKIAJFBFLQYK5FLCJLFQ",
  secretAccessKey: "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"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

// Show all dishes in the menu
function fetchDishes(){
  localStorage.clear();

  var params = {
    TableName: 'foodInformation'
  };
  
  docClient.scan(params, onScan);

  function onScan(err, data) {
    
    if (err) {
      console.log( "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2));
    } else {
      var fooddata = data;
      console.log (fooddata)
      
      var dishesList = document.getElementById('dishesList');
      dishesList.innerHTML = '<h2>Menu</h2><p><br/></p>';

      for (var key in data) {
          if (data.hasOwnProperty(key)) {
          var obj = data[key];
          for (var prop in obj) {
            dishesList.innerHTML += ('<img src='+obj[prop].imageurl+' alt="food image" style="width:170px;height:160px;border:0;"><h5><strong>'
                              +obj[prop].name+'</strong></h5><p><i>'
                              +obj[prop].description+'</i></p><b>$'
                              +obj[prop].cost+'</b><p>'
                              +obj[prop].location+'</p>'+
                              '<button id = "addToCartButton" dish_data=' +JSON.stringify(obj[prop]).replace(/ /g,"_")+ ' onclick="addToCart(this); " class="btn btn-primary">Add to Cart</button><hr>');
                            }
        }
      }
    }
      
  params.ExclusiveStartKey = data.LastEvaluatedKey;
  }
}



// Add a dish to cart when user click add to cart button
function addToCart(event){
  var dish_data = JSON.parse(event.getAttribute("dish_data").replace(/_/g," "));
  var cart_data = {};

  //If cart_data is empty right now
  if (localStorage.getItem('cart_data') == null) {
    cart_data["time"] = Date.now();
    cart_data["user_email"] = user_email;
    cart_data["dishes"] = [];
    cart_data["total_cost"] = 0;
  } 
  else {
    cart_data = JSON.parse(localStorage.getItem('cart_data'));
    if (!cart_data.hasOwnProperty("dishes")){
      cart_data["dishes"] = [];
    }
  }

  cart_data["dishes"].push(dish_data); 
  cart_data["total_cost"] += dish_data.cost;

  localStorage.setItem('cart_data', JSON.stringify(cart_data));

  console.log("Add new item to cart_data");
  console.log(cart_data);

  // Show items in cart
  fetchCart();
  
  // Redirect the user to the cart page
  // var url= "/cart"; 
  // window.location = url; 
}

// Load dishes from cart (stored in localStorage)
function fetchCart() {
  if (localStorage.getItem('cart_data') != null){
    var cart_data = JSON.parse(localStorage.getItem('cart_data'));

    if (cart_data.hasOwnProperty("dishes")){
      var ordered_dishes = cart_data["dishes"];

      console.log("Reading from cart");
      console.log(cart_data);

      var cartList = document.getElementById('cartList');
      

      if(ordered_dishes.length != 0){
        cartList.innerHTML = '<h2>Your cart</h2><p><br/></p>';
      }
      else{
        cartList.innerHTML = "";
      }

      for (var i = 0; i < ordered_dishes.length; i++) {
        var imageURL = ordered_dishes[i].imageurl;
        var dish_name = ordered_dishes[i].name;
        //var description = ordered_dishes[i].description;
        var cost = ordered_dishes[i].cost;
        var location = ordered_dishes[i].location;

        cartList.innerHTML +=   ('<img src=' + imageURL +' alt="food image" style="width:170px;height:160px;border:0;"><h5><strong>'
                                + dish_name + '</strong></h5><b>$'
                                + cost + '</b><p>'
                                + location+'</p>'+
                                '<button id = "removeFromCartButton" dish_data=' +JSON.stringify(ordered_dishes[i]).replace(/ /g,"_")+ ' onclick="removeFromCart(this); " class="btn btn-danger">Remove from cart</button><hr>');
      } 

      if(ordered_dishes.length != 0){
        cartList.innerHTML += '<h3>Total cost: <b>$' + cart_data["total_cost"].toFixed(2) + ' </b></h3>';
        if (window.location.href.indexOf('/')){
          cartList.innerHTML += '<a href="payment.html"  class="btn btn-success" style="float: right;">Pay now</a><p><br/></p>';
        }
        
      }
    }
  }
}



// Add a dish to cart when user click add to cart button
function removeFromCart(event){

  // Reading from the JSON passed by the removeFromCart button
  var to_remove_dish = JSON.parse(event.getAttribute("dish_data").replace(/_/g," "));
  var to_remove_dish_name = to_remove_dish.name;
  var to_remove_cost = to_remove_dish.cost;

  // Get object cart_data from localStorage
  var cart_data = JSON.parse(localStorage.getItem('cart_data'));
  var ordered_dishes = cart_data["dishes"];

  // Loop through ordered_dishes to find the dish that matches dish_name
  for (var i = 0; i < ordered_dishes.length; i++) {
    var dish_name = ordered_dishes[i].name;

    if (dish_name.localeCompare(to_remove_dish_name) == 0){
      ordered_dishes.splice(i, 1);
      cart_data["total_cost"] -= to_remove_cost;
      break;
    }
  }
  
  // Update cart_data in localStorage
  cart_data["dishes"] = ordered_dishes; 
  localStorage.setItem('cart_data', JSON.stringify(cart_data));

  console.log("Removed an item from cart_data");
  console.log(cart_data);

  // Show items in cart
  fetchCart();
  
  // Redirect the user to the cart page
  // var url= "/cart"; 
  // window.location = url; 
}


// document.addEventListener("DOMContentLoaded", function(event) { 
// 	var data = JSON.parse(localStorage.getItem("food"));
// 	console.log(data);
// 	for (var key in data) {
// 					   if (data.hasOwnProperty(key)) {
// 								document.getElementById('orderedMenu').innerHTML += ('<li><img src='+data[key].imageurl+' alt="food image" style="width:150px;height:140px;border:0;"></li><h2>'
// 																						+data[key].name+'</h2><h3>$'
// 																						+data[key].cost+'</h3><p>'
// 																						+data[key].location+'</p>'+
// 																						'<button id = "CancelButton" obj_data=' +JSON.stringify(data[key]).replace(/ /g,"_")+ ' onclick="removeFunction(this);">Remove</button>');
// 						  }
// 					   }
// 	});