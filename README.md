# Author
Nhi Huynh
Radhika Zawar

# About this web application
Written for Cloud Computing Assignment 2.
A website that allows users to order food from multiple restaurants
Deployed in Google App Engine https://cloud-computing-a2-food.appspot.com/ 

# Features
Log in and sign out using Google accounts
Order dishes from multiple restaurants
Pay online using Google Pay
Receive an order summary through email 

# Technology stack
Javascript
HTML
CSS
Bootstrap
Google Cloud Services 
Amazon Web Services

# How to run our app - a developer’s manual

Clone the project from our Github repo
*git clone https://github.com/radhikazawar9/cloud-computing.git*

Install Google Cloud SDK, add Google Cloud SDK to PATH
*https://cloud.google.com/sdk/install*

Create a Google Cloud Platform project
*https://cloud.google.com/appengine/docs/standard/nodejs/building-app/creating-project*

Open terminal/command line, run these commands to authenticate
*gcloud auth*

After logging in your Google account, run these commands to choose project
*gcloud config set project my-project-id*

Go to the directory of the cloned Github repo, run
*gcloud app deploy*

After deployment, run this command to interact with the deployed website on the browser
*gcloud app browse*


If you want to run our application in a local development server,

Go to the directory of the cloned Github repo, run
*dev_appserver.py app.yaml*

Open your browser, go to http://localhost:8080/ and explore our app!

If you change any code in the application folder, dev_appserver.py will automatically update the changes in http://localhost:8080/
