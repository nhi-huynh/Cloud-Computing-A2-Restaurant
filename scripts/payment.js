
///Google map and Autofill address related functionalities
var delivery_place;

//Read cart data to alert successful log in
var cart_data = JSON.parse(localStorage.getItem('cart_data'));
var user_name = cart_data["user_name"];
var user_email = cart_data["user_email"];

google.maps.event.addDomListener(window, 'load', autocompleteAddress);
function autocompleteAddress() {
  // Read address input from the html form
  var address_input = document.getElementById('address_search');

  // Get an autocomplete address from the form input
  var autocomplete = new google.maps.places.Autocomplete(address_input);

  // If the form input changes, do the same thing over again
  autocomplete.addListener('place_changed', function () {
    delivery_place = autocomplete.getPlace();
    console.log(delivery_place['formatted_address']);
    
    $('#lat').val(delivery_place.geometry['location'].lat());
    $('#long').val(delivery_place.geometry['location'].lng());

    // Write delivery address to cart_data in localStorage
    saveDeliveryAddress(delivery_place['formatted_address']);
    fetchOrderSummary();
  });
}

// Save the delivery address to cart_data in localStorage
function saveDeliveryAddress(delivery_address){
  var cart_data = JSON.parse(localStorage.getItem('cart_data'));
  var delivery_method = document.getElementById("shippingMethodInput").value;

  cart_data["delivery_address"] = delivery_address;
  cart_data["delivery_method"] = delivery_method;

  localStorage.setItem('cart_data', JSON.stringify(cart_data));

  console.log("Update delivery address and method to cart_data");
  console.log(cart_data);
}

// Load order summary from cart (stored in localStorage)
function fetchOrderSummary() {
  

  //Read cart_data from localStorage
  var cart_data = JSON.parse(localStorage.getItem('cart_data'));
  var ordered_dishes = cart_data["dishes"];

  console.log("Fetching order summary");
  console.log(cart_data);

  //Update cart view
  var orderSummary = document.getElementById('orderSummary');

  if(ordered_dishes.length != 0){
    orderSummary.innerHTML = '<h2>Order summary</h2><p><br/></p>';
  }
  else{
    orderSummary.innerHTML = "";
  }

  //Update orderSummary view
  var orderSummary = document.getElementById('orderSummary');

  for (var i = 0; i < ordered_dishes.length; i++) {
    var imageURL = ordered_dishes[i].imageurl;
    var dish_name = ordered_dishes[i].name;
    //var description = ordered_dishes[i].description;
    var cost = ordered_dishes[i].cost;
    var location = ordered_dishes[i].location;

    orderSummary.innerHTML +=   ('<img src=' + imageURL +' alt="food image" style="width:170px;height:160px;border:0;"><h5><strong>'
                            + dish_name + '</strong></h5><b>$'
                            + cost + '</b><p>'
                            + location+'</p>'
    );
  } 

  if(ordered_dishes.length != 0){
    orderSummary.innerHTML += '<h3>Total cost: <b>$' + cart_data["total_cost"].toFixed(2) + ' </b></h3><p> </p>';
    // orderSummary.innerHTML += '<h3>Paid: <b>$' + cart_data["total_cost"].toFixed(2) + ' </b></h3>';
  }

  if(cart_data["delivery_address"] != ""){
    orderSummary.innerHTML += '<h3>Delivery address</h3><p>' 
                         + cart_data["delivery_address"] + '</p><p> </p>';
  }
  else{
    orderSummary.innerHTML += "";
  }

  return orderSummary.innerHTML;
}

// The rest of the code is for Google Pay API, taken from https://developers.google.com/pay/api/web/guides/tutorial
// The code is modified to work for this assignment
/**
 * Define the version of the Google Pay API referenced when creating your
 * configuration
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentDataRequest|apiVersion in PaymentDataRequest}
 */
const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

/**
 * Card networks supported by your site and your gateway
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#CardParameters|CardParameters}
 * @todo confirm card networks supported by your site and gateway
 */
const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];

/**
 * Card authentication methods supported by your site and your gateway
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#CardParameters|CardParameters}
 * @todo confirm your processor supports Android device tokens for your
 * supported card networks
 */
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

/**
 * Identify your gateway and your site's gateway merchant identifier
 *
 * The Google Pay API response will return an encrypted payment method capable
 * of being charged by a supported gateway after payer authorization
 *
 * @todo check with your gateway on the parameters to pass
 * @see {@link https://developers.google.com/pay/api/web/reference/object#Gateway|PaymentMethodTokenizationSpecification}
 */
const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    'gateway': 'example',
    'gatewayMerchantId': 'exampleGatewayMerchantId'
  }
};

/**
 * Describe your site's support for the CARD payment method and its required
 * fields
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#CardParameters|CardParameters}
 */
const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks
  }
};

/**
 * Describe your site's support for the CARD payment method including optional
 * fields
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#CardParameters|CardParameters}
 */
const cardPaymentMethod = Object.assign(
  {},
  baseCardPaymentMethod,
  {
    tokenizationSpecification: tokenizationSpecification
  }
);

/**
 * An initialized google.payments.api.PaymentsClient object or null if not yet set
 *
 * @see {@link getGooglePaymentsClient}
 */
let paymentsClient = null;

/**
 * Configure your site's support for payment methods supported by the Google Pay
 * API.
 *
 * Each member of allowedPaymentMethods should contain only the required fields,
 * allowing reuse of this base request when determining a viewer's ability
 * to pay and later requesting a supported payment method
 *
 * @returns {object} Google Pay API version, payment methods supported by the site
 */
function getGoogleIsReadyToPayRequest() {
  return Object.assign(
      {},
      baseRequest,
      {
        allowedPaymentMethods: [baseCardPaymentMethod]
      }
  );
}

/**
 * Configure support for the Google Pay API
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentDataRequest|PaymentDataRequest}
 * @returns {object} PaymentDataRequest fields
 */
function getGooglePaymentDataRequest() {
  const paymentDataRequest = Object.assign({}, baseRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
  paymentDataRequest.merchantInfo = {
    // @todo a merchant ID is available for a production environment after approval by Google
    // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
    // merchantId: '01234567890123456789',
    merchantName: 'Example Merchant'
  };
  return paymentDataRequest;
}

/**
 * Return an active PaymentsClient or initialize
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
 * @returns {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
  if ( paymentsClient === null ) {
    paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
  }
  return paymentsClient;
}

/**
 * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
 *
 * Display a Google Pay payment button after confirmation of the viewer's
 * ability to pay.
 */
function onGooglePayLoaded() {
  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
      .then(function(response) {
        if (response.result) {
          addGooglePayButton();
          // @todo prefetch payment data to improve performance after confirming site functionality
          // prefetchGooglePaymentData();
        }
      })
      .catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
      });
  
  // Update the pay banner once the user enter the payment page
  document.getElementById("payBanner").innerHTML = "<strong>You have some good dishes here " + user_name + 
  "!</strong>";
}

/**
 * Add a Google Pay purchase button alongside an existing checkout button
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#ButtonOptions|Button options}
 * @see {@link https://developers.google.com/pay/api/web/guides/brand-guidelines|Google Pay brand guidelines}
 */
function addGooglePayButton() {
  const paymentsClient = getGooglePaymentsClient();
  const button =
      paymentsClient.createButton({onClick: onGooglePaymentButtonClicked});
  document.getElementById('paymentForm').appendChild(button);
}

/**
 * Provide Google Pay API with a payment amount, currency, and amount status
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#TransactionInfo|TransactionInfo}
 * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
 */
function getGoogleTransactionInfo() {
  return {
    countryCode: 'AU',
    currencyCode: 'AUD',
    totalPriceStatus: 'FINAL',
    // set to cart total
    totalPrice: getTotalPrice().toString()
  };
}

/**
 * Prefetch payment data to improve performance
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/client#prefetchPaymentData|prefetchPaymentData()}
 */
function prefetchGooglePaymentData() {
  const paymentDataRequest = getGooglePaymentDataRequest();
  // transactionInfo must be set but does not affect cache
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
    currencyCode: 'AUD'
  };
  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.prefetchPaymentData(paymentDataRequest);
}

/**
 * Show Google Pay payment sheet when Google Pay payment button is clicked
 */
function onGooglePaymentButtonClicked() {
  const paymentDataRequest = getGooglePaymentDataRequest();
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.loadPaymentData(paymentDataRequest)
      .then(function(paymentData) {
        // handle the response
        processPayment(paymentData);
      })
      .catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
      });
}

/**
 * IMPORTANT - MAIN FUNCTION
 * Process payment data returned by the Google Pay API
 *
 * @param {object} paymentData response from Google Pay API after user approves payment
 * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentData|PaymentData object reference}
 */
function processPayment(paymentData) {
  // show returned data in developer console for debugging
    console.log(paymentData);

  // @todo pass payment token to your gateway to process payment
  paymentToken = paymentData.paymentMethodData.tokenizationData.token;

  // If order info is written to AWS Dynamo sucessfully
  if (writeOrderAWS) {
      // document.getElementById("messageText").innerHTML = "Order Successful! your Food is on the way";

      // Clear past order in localStorage, prepare for a new order
      clearUserOrder();

      // Redirect the user to the thank you page
      var url= "/thankyou"; 
      window.location = url; 

      console.log("Cart data after payment")
      console.log(localStorage.getItem("cart_data"));

      // Send order summary email to user_email
      sendEmail(fetchOrderSummary());
    }
}

//Write order data to AWS
function writeOrderAWS(){
  AWS.config.update(aws_dynamo_order_config);

  var docClient = new AWS.DynamoDB.DocumentClient();
  var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  var index = Date.now()
  var cartData = JSON.parse(localStorage.getItem("food"));
    
  for (var key in cartData) {
    if (cartData.hasOwnProperty(key)) {
      var params = {
        TableName: 'CustomerOrderTable',
        Item: {
        'orderID' : { N: index.toString() },
        'customer' : { S: cartData[key].cartHolder },
        'foodName' : {S: cartData[key].name },
        'quantity' : {N: cartData[key].quantity.toString() },
        'cost' : {N: cartData[key].cost.toString() },
        'paid' : {N: (cartData[key].quantity*cartData[key].cost).toString() },
        'deliveryLocation' : {S: delivery_place['formatted_address']}
        }
      };

      // Call DynamoDB to add the item to the table
      ddb.putItem(params, function(err, data) {
        if (err) {
          console.log("Error: ", err);
          return false;
        } 
        else {
          console.log("Success", data);
          return true;
        }
      });
    } 
    index++;
  }
}

// Clear past order in localStorage, prepare for a new order
function clearUserOrder(){
  var cart_data = JSON.parse(localStorage.getItem('cart_data'));
  cart_data["dishes"] = [];
  cart_data["total_cost"] = 0;

  localStorage.setItem('cart_data', JSON.stringify(cart_data));

  console.log("Clear dishes in cart_data");
  console.log(cart_data);
}

function getTotalPrice(){
  var cart_data = JSON.parse(localStorage.getItem('cart_data'));
  return cart_data["total_cost"].toFixed(2);
}

// using SMTPJS https://www.smtpjs.com/ to send email
// Server setup using 
function sendEmail(){  	//(orderSummaryHtml){
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(SENDGRID_API_KEY);
  // const msg = {
  //   to: user_email,
  //   from: 'cloudcomputingrmit2019@gmail.com', //'test@example.com',
  //   subject: 'Order confirmation from Melbourne Food Services',
  //   text: 'Thank you for ordering from us. Your order summary is as below.',
  //   html: orderSummaryHtml,
  // };
  // sgMail.send(msg);

  // Email.send({
  //   Host : "smtp.yourisp.com",
  //   Username : "username",
  //   Password : "password",
  //   To : 'them@website.com',
  //   From : "you@isp.com",
  //   Subject : "This is the subject",
  //   Body : "And this is the body"
  //   }).then(
  //     message => alert(message)
  //   );

  // Email.send({
  //   Host : "smtp.elasticemail.com",
  //   Username : "cloudcomputingrmit2019@gmail.com",
  //   Password : "6bc8c24d-ffae-432a-8a97-39951d13790f",
  //   To : 'uyennhi.huynhluu@gmail.com',  //user_email,
  //   From : 'cloudcomputingrmit2019@gmail.com',
  //   Subject : 'Order confirmation from Melbourne Food Services',
  //   Body : '<h2>Thank you for ordering from us. Your order summary is as below.</h2>', //+ orderSummaryHtml,
  // }).then(
  //   message => alert(message)
  // );

  // Email.send("cloudcomputingrmit2019@abc.com",
  //   'uyennhihuynhluu@gmail.com', 
  //   "This is a subject",
  //   "this is the body",
  //   "smtp.elasticemail.com",
  //   "cloudcomputingrmit2019@gmail.com",
  //   "6bc8c24d-ffae-432a-8a97-39951d13790f",
  // );

  console.log("Sending order summary email");
  // Email.send({
  //   Host : "smtp.elasticemail.com",
  //   Username : "cloudcomputingrmit2019@gmail.com",
  //   Password : "6bc8c24d-ffae-432a-8a97-39951d13790f",
  //   To : 'uyennhihuynhluu@gmail.com',  //user_email,
  //   From : 'cloudcomputingrmit2019@gmail.com',
  //   Subject : 'Order confirmation from Melbourne Food Services',
  //   Body : '<h2>Thank you for ordering from us. Your order summary is as below.</h2>', //+ orderSummaryHtml,
  // }).then(
  //   message => alert(message)
  // );

  Email.send({
    SecureToken : 'cf164dbe-cf77-491a-a04b-227566595730',    //"7ec903b3-67ac-4f64-83ce-0dd7a7416ae5",
    To : "cloudcomputingrmit2019@gmail.com", //'uyennhihuynhluu@gmail.com',
    From : "cloudcomputingrmit2019@gmail.com",
    Subject : "This is the subject",
    Body : "And this is the body"
}).then(
  message => alert(message)
);
}
