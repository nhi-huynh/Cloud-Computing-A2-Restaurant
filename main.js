// env_variables:
//   BUCKET_NAME: "example-gcs-bucket"
var user_id, user_name;
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    user_id = profile.getId();
    user_name = profile.getName();
    document.getElementById("requestLogin").innerHTML = "Hi " + user_name + "! What would you like to eat today?";
    document.getElementById("requestLogin").style.display = "block";
    document.getElementById("menu").style.display = "block";
    
    loadData();
    
  }
  
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


function fetchDishes(){

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
      
      for (var key in data) {
          if (data.hasOwnProperty(key)) {
          var obj = data[key];
          for (var prop in obj) {
            document.getElementById('dishesList').innerHTML += ('<div class="container"><img src='+obj[prop].imageurl+' alt="food image" style="width:170px;height:160px;border:0;"><h5><strong>'
                              +obj[prop].name+'</strong></h5><p><i>'
                              +obj[prop].description+'</i></p><b>$'
                              +obj[prop].cost+'</b><p>'
                              +obj[prop].location+'</p>'+
                              '<button id = "addToCartButton" dish_data=' +JSON.stringify(obj[prop]).replace(/ /g,"_")+ ' onclick="addDishToCart(this); " class="btn btn-primary">Add to Cart</button><hr></div>');
          }
        }
      }
    }
      
  params.ExclusiveStartKey = data.LastEvaluatedKey;
  }
}


// Add the dish to cart, stored in localStorage
document.getElementById('addToCartButton').addEventListener('click', addDishToCart);
function addDishToCart(dish){
  //localStorage.clear();
  dish_data = dish.getAttribute("cart_data");
  dish_data = dish_data.replace(/_/g," ")
  dish_data = JSON.parse(dish_data)

  console.log(dish_data)

  var currentCart = JSON.parse( localStorage.getItem('cart') ) || {};
  currentCart["time"] = Date.now();
  currentCart["user_email"] = "";
  currentCart["dishes"].push(dish_data);
  localStorage.setItem('cart', JSON.stringify(selectedMenu));
  
  var de = JSON.parse(window.localStorage.getItem("cart"));
  console.log(de);
  
  var url= "/cart"; 
  window.location = url; 
  
}

// Load dishes from cart (stored in localStorage)
function fetchCart() {
  var cart = JSON.parse(localStorage.getItem('cart'));
  var ordered_dishes = cart["dishes"];

  console.log("Reading from cart");
  console.log(cart);

  var cartList = document.getElementById('cartList');

  cartList.innerHTML = '';

  for (var i = 0; i < ordered_dishes.length; i++) {
    var imageURL = cart[i].imageurl;
    var dish_name = dishes[i].description;
    var cost = dishes[i].severity;
    var assignedTo = dishes[i].assignedTo;
    var status = dishes[i].status;

    dishesList.innerHTML +=   '<div class="well">'+
                              '<h6>dish ID: ' + id + '</h6>'+
                              '<p><span class="label label-info">' + status + '</span></p>'+
                              '<h3>' + desc + '</h3>'+
                              '<p><span class="glyphicon glyphicon-time"></span> ' + severity + '</p>'+
                              '<p><span class="glyphicon glyphicon-user"></span> ' + assignedTo + '</p>'+
                              '<a href="#" onclick="setStatusClosed(\''+id+'\')" class="btn btn-warning">Close</a> '+
                              '<a href="#" onclick="deletedish(\''+id+'\')" class="btn btn-danger">Delete</a>'+
                              '</div>';
  }
}

document.addEventListener("DOMContentLoaded", function(event) { 
	var data = JSON.parse(localStorage.getItem("food"));
	console.log(data);
	for (var key in data) {
					   if (data.hasOwnProperty(key)) {
								document.getElementById('orderedMenu').innerHTML += ('<li><img src='+data[key].imageurl+' alt="food image" style="width:150px;height:140px;border:0;"></li><h2>'
																						+data[key].name+'</h2><h3>$'
																						+data[key].cost+'</h3><p>'
																						+data[key].location+'</p>'+
																						'<button id = "CancelButton" obj_data=' +JSON.stringify(data[key]).replace(/ /g,"_")+ ' onclick="removeFunction(this);">Remove</button>');
							 
						  }
					   }
	});
	
	
	function removeFunction(obj){
			data = obj.getAttribute("obj_data");

			data = data.replace(/_/g," ")

			data = JSON.parse(data)
			console.log(data);
			console.log(data.name);
			//data = obj.getAttribute("imageurl": obj.imageurl);
			//window.localStorage.removeItem(data.name);
	}


// dishes app source code
document.getElementById('addButton').addEventListener('click', addCart);

function addCart(e) {
  var dishDesc = document.getElementById('dishURL').value;
  var disheseverity = document.getElementById('disheseverityInput').value;
  var dishAssignedTo = document.getElementById('dishAssignedToInput').value;
  var dishId = chance.guid();
  var dishestatus = 'Unselectect';

  var dish = {
    id: dishId,
    description: dishDesc,
    severity: disheseverity,
    assignedTo: dishAssignedTo,
    status: dishestatus
  }

  if (localStorage.getItem('dishes') == null) {
    var dishes = [];
    dishes.push(dish);
    localStorage.setItem('dishes', JSON.stringify(dishes));
  } else {
    var dishes = JSON.parse(localStorage.getItem('dishes'));
    dishes.push(dish);
    localStorage.setItem('dishes', JSON.stringify(dishes));
  }

  document.getElementById('dishInputForm').reset();

  fetchdishes();

  e.preventDefault();
}

function setStatusClosed(id) {
  var dishes = JSON.parse(localStorage.getItem('dishes'));

  for (var i = 0; i < dishes.length; i++) {
    if (dishes[i].id == id) {
      dishes[i].status = 'Closed';
    }
  }

  localStorage.setItem('dishes', JSON.stringify(dishes));

  fetchdishes();
}

function deletedish(id) {
  var dishes = JSON.parse(localStorage.getItem('dishes'));

  for (var i = 0; i < dishes.length; i++) {
    if (dishes[i].id == id) {
      dishes.splice(i, 1);
    }
  }

  localStorage.setItem('dishes', JSON.stringify(dishes));

  fetchdishes();
}

function fetchdishes() {
  var dishes = JSON.parse(localStorage.getItem('dishes'));
  var dishesListe = document.getElementById('dishesList');

  dishesList.innerHTML = '';

  for (var i = 0; i < dishes.length; i++) {
    var id = dishes[i].id;
    var desc = dishes[i].description;
    var severity = dishes[i].severity;
    var assignedTo = dishes[i].assignedTo;
    var status = dishes[i].status;

    dishesList.innerHTML +=   '<div class="well">'+
                              '<h6>dish ID: ' + id + '</h6>'+
                              '<p><span class="label label-info">' + status + '</span></p>'+
                              '<h3>' + desc + '</h3>'+
                              '<p><span class="glyphicon glyphicon-time"></span> ' + severity + '</p>'+
                              '<p><span class="glyphicon glyphicon-user"></span> ' + assignedTo + '</p>'+
                              '<a href="#" onclick="setStatusClosed(\''+id+'\')" class="btn btn-warning">Close</a> '+
                              '<a href="#" onclick="deletedish(\''+id+'\')" class="btn btn-danger">Delete</a>'+
                              '</div>';
  }
}
