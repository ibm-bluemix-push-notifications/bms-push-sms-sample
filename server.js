
var basicAuth = require('express-basic-auth')

var express = require("express"),
    app = express();

var twilio = require('twilio');
var twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var push = require("./lib/push.js"),
    registerDevice = push.registerDevice,
    unregisterDevice = push.unregisterDevice;
    getSubscriptions = push.getSubscriptions;
    subcribeToTag = push.subcribeToTag;
    unSubcribeToTag = push.unSubcribeToTag;
    reportMessage = push.reportMessage;

var bodyParser = require('body-parser');

app.use(basicAuth({
    users: { 'admin': 'admin' }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.post('/registermobile', function(request, response) {
    console.log('Request to register a mobile number ' + request.body.mobileNumber);
    if(request.body.mobileNumber.trim().length == 0) {
        response.end("No mobile number provided. Please provide a mobile number");
    }
    else if(request.body.uniqueId.trim().length == 0) {
        response.end("No unique name provided. Please provide a unique name");
    }
    else {
        registerDevice(request.body.uniqueId, request.body.mobileNumber, function(status, responseStr) {
            response.end(responseStr);
        });
    }
});

app.post('/send', function(request, response) {
    console.log("Send message to mobile " + request.body.properties.id);
    console.log("Send the alert " + request.body.alert);
    console.log("Device Id is " + request.body.deviceId);
    var payload = JSON.parse(request.body.payload);
    console.log("The notification Id is " + payload.nid);

    reportMessage(request.body.deviceId, payload.nid, 'SEEN', function(){}, function(){});
    twilioClient.messages.create({
            body: request.body.alert,
            to: request.body.properties.id,
            from: process.env.TWILIO_FROM_NUMBER
        })
        .then((message) => {console.log(message.sid); reportMessage(request.body.deviceId, payload.nid, 'OPEN', function(){}, function(){});});
    response.end();
});

app.post('/subscribe/', function(request, response) {
    var uniqueId = request.body.uniqueName;
    var tagName = request.body.tagName;
    console.log("Subscribe the mobile number " + uniqueId + " to the tag " + tagName);
    subcribeToTag(uniqueId, tagName, function(code, responseStr) {
        response.statusCode = code;
        response.end(responseStr);
    });
    
});

app.delete('/subscribe/:uniqueId/:tagName', function(request, response) {
    var uniqueId = request.params.uniqueId;
    var tagName = request.params.tagName;
    console.log("Unsubscribe the mobile number " + uniqueId + " to the tag " + tagName);
    unSubcribeToTag(uniqueId, tagName, function(code, responseStr) {
        response.statusCode = code;
        response.end(responseStr);
    });
    
});

app.delete('/registermobile/:unique_name', function(request, response) {
    var uniqueId = request.params.unique_name;
    console.log('Request to unregister a mobile number ' + uniqueId);
    unregisterDevice(uniqueId, function(code, responseStr) {
        if(code == 204) {
            response.end("Unregistered device " + uniqueId);
        }
        else {
            response.end(responseStr);
        }
        
    });
});

app.get('/subscriptions/:mobileNumber', function(request, response){
    var mobileNumber = request.params.mobileNumber;
    console.log('Request to get subscriptions for a mobile number ' + mobileNumber);
    getSubscriptions("mobile", mobileNumber, function(code, responseStr){
        response.statusCode = code;
        response.end(JSON.stringify(responseStr));
    });
    
});

app.get('/health', function(request, response){
  console.log('The node server is up and running');
  response.end();
});

app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();
