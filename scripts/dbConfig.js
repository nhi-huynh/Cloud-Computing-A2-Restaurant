// import aws_dynamo_order_config from 'aws-config.js';

// Access to AWS DynamoDB 
// AWS.config.update({
//     region: "ap-southeast-2",
//     endpoint: "https://dynamodb.ap-southeast-2.amazonaws.com",
//     accessKeyId: "AKIAJFBFLQYK5FLCJLFQ",
//     secretAccessKey: "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"
//   });

// AWS.config.update(aws_dynamo_config);
// var docClient = new AWS.DynamoDB.DocumentClient();
// var s3 = new AWS.S3();

function updateCustomerTable(){
  var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  var index = Date.now()
  console.log(index);
  var params = {
    TableName: 'CustomerVisitTable',
    Item: {
    'id' : { N: index.toString() },
    'gmailId' : {N: id},
    'CustomerName' : {S: name}
    }
  };

  // Call DynamoDB to add the item to the table
  ddb.putItem(params, function(err, data) {
    if (err) {
    console.log("Error", err);
    } else {
    console.log("Success", data);
    }
  });
}