var http = require('http');
var url = require('url');

var vcapServices = require('vcap_services');

getPushHttpOptions = function(pushPath, httpMethod) {
    var credentials = vcapServices.getCredentials(process.env.IMFPUSH);
    if(!credentials.url) {
        console.log("The node application is not bound to push.");
        console.log("Attempting to use the environment settings " + process.env.PUSH_URL);
        credentials = {
            url: process.env.PUSH_URL,
            clientSecret: process.env.PUSH_CLIENT_SECRET
        }
    }
    var pushUrl = url.parse(credentials.url);
    return {
            host: pushUrl.hostname,
            port: 80,
            path: pushUrl.pathname + pushPath,
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'clientSecret': credentials.clientSecret
            }
        };
}

module.exports = {
    
    unSubcribeToTag: function (deviceId, tagName, successCallback, errorCallback) {
        var unsubscriptionOptions = getPushHttpOptions('/subscriptions?deviceId=' + deviceId + '&tagName=' + tagName, 'DELETE');
        var data = '';
        var req = http.request(unsubscriptionOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                successCallback(resp.statusCode, data);
            });
        });
        req.on('error', function (e) {
            console.log('Got error: ' + e.message);
            errorCallback(e);
        });
        req.end();
    },
    subcribeToTag: function (deviceId, tagName, successCallback, errorCallback) {
        var data = '';
        var subscribeOptions = getPushHttpOptions('/subscriptions', 'POST');
        var req = http.request(subscribeOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                console.log("Response for subscribe" + resp.statusCode);
                successCallback(resp.statusCode, data);
            });
        });
        req.on('error', function (e) {
            console.log('Got error: ' + e.message);
            errorCallback(e);
        });
        req.write(JSON.stringify({
            'deviceId': deviceId,
            'tagName': tagName
        }));
        req.end();
    },
    getSubscriptions: function (type, id, successCallback, errorCallback) {
        var data = '';
        var subscribeOptions = getPushHttpOptions('/subscriptions?deviceId=' + id, 'GET');
        var req = http.request(subscribeOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                console.log("Response for subscribe" + resp.statusCode);
                if (resp.statusCode == 200) {
                    var tagArr = [];
                    var jsonData = JSON.parse(data);
                    var jsonSubArr = jsonData.subscriptions;
                    for (var i = 0; i < jsonSubArr.length; i++) {
                        tagArr.push(jsonSubArr[i].tagName);
                    }
                    successCallback(resp.statusCode, tagArr);
                }
                else {
                    successCallback(resp.statusCode, data);
                }

            });
        });
        req.on('error', function (e) {
            console.log('Got error: ' + e.message);
            errorCallback(e);
        });
        req.end();
    },
    getDevice: function (type, id, successCallback, errorCallback) {
        var data = '';
        var getOptions = getPushHttpOptions('/devices/' +  id, 'GET');
        var req = http.request(getOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                successCallback(resp.statusCode, data);
            });
        });
        req.on('error', function (e) {
            console.log('Got error: ' + e.message);
            errorCallback(e);
        });
    },
    unregisterDevice: function (deviceId, successCallback, errorCallback) {
       var unregisterOptions = getPushHttpOptions('/devices/' + deviceId, 'DELETE');
        var data = '';
        var req = http.request(unregisterOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                successCallback(resp.statusCode, data);
            });
            resp.on('error', function (e) {
                console.log('Got error: ' + e.message);
                errorCallback(e);
            });
        });
        req.end();
    },

    registerDevice: function (deviceId, mobileNumber, successCallback, errorCallback) {
        var registerOptions = getPushHttpOptions('/devices/', 'POST');
        var data = '';
        var req = http.request(registerOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                successCallback(resp.statusCode, data);
            });
            resp.on('error', function (e) {
                console.log('Got error: ' + e.message);
                errorCallback(e);
            });
        });
        req.write(JSON.stringify({
            'deviceId': deviceId,
            'platform': 'HTTP',
            'attributes': {
                'id': mobileNumber
            }
        }));
        req.end();
    },

    reportMessage: function (deviceId, messageId, state, successCallback, errorCallback) {
        var reportOptions = getPushHttpOptions('/messages/' + messageId, 'PUT');
        var data = '';
        var req = http.request(reportOptions, function (resp) {
            resp.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                data += chunk;
            });
            resp.on('end', function () {
                successCallback(resp.statusCode, data);
            });
            resp.on('error', function (e) {
                console.log('Got error: ' + e.message);
                errorCallback(e);
            });
        });
        req.write(JSON.stringify({
            'deviceId': deviceId,
            'status': state
        }));
        req.end();
    }
}