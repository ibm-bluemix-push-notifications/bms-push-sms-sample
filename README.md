# bms-push-sms-sample
Demonstrate extending Bluemix Push Notifications to SMS
## Prerequisites
* Twilio Account ( https://www.twilio.com/)
* Bluemix account (https://console.bluemix.net)

## Setup for Twilio
Follow the instructions in Twilio to create an account and obtain Account SID and Auth token. Also get a Phone number that can be used as a sending number.

## Setup for bluemix
Create or login to your bluemix account and create an instance of push with the name "bms-push-notifications" in your space

## Setup for the sample
* Download this code from git and edit the manifest file.
* Add your Twilio account SID in "TWILIO_ACCOUNT_SID" variable. Add your Twilio Auth Token to "TWILIO_AUTH_TOKEN" and also add Twilio SMS number to "TWILIO_FROM_NUMBER".
* Login to Bluemix using command line (either bx or cf tool) and target your space in bluemix
* Do a "cf push" in the sample's root folder

## Configure Push Service with the sample
* Open the Push Notification service instance or use the REST API of Push and add the HTTP configuration to point to the bluemix app you uploaded in the previous step. For example the end point will be "http://bms-push-sms-sample.bluemix.net/send". The "/send" is the path on which the node application is configured for POST.
* Also create a tag in Push names "CarLoan".
* Now open the URL of the node application and input the mobile number and a unique name for the mobile number and hit "Register" button. The unique name is used as a deviceId for the registering.
* Now send the message using the Push Notification service dashboard or the Push Notification Service REST API targetting the device, platform or tag name.
* You will see an sms on your mobile.
