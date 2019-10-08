  //Read cart data to alert successful payment
var cart_data = JSON.parse(localStorage.getItem('cart_data'));
var user_name = cart_data["user_name"];
  
function sendConfirmationEmail() {
    // Call API to send confirmation email
    
    // Update the pay banner once the user enter the thank you page
    document.getElementById("payBanner").innerHTML = "<strong>Payment made by " + user_name + 
    " is successful</strong>";
}


