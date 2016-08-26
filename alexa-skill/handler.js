/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */
var https = require("https");
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else if ("ReadingIntent" === intentName) {
        getReadingIntentResponse(intent, session, callback);
    } else if ("TextingIntent" === intentName) {
        getTextingIntentResponse(intent, session, callback);
    } else {
        getWelcomeResponse(callback);
        //throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to Talking Whatsapp!";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Say read or text";
    var shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getReadingIntentResponse(intent, session, callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};

    https.get('https://alexa-whatsapp.herokuapp.com/message', function(res) {
        console.log("Got response: " + res.statusCode);
        // res.setEncoding('utf8');
        var body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            console.log(parsed);
            
            var cardTitle = {};
            var msg_num = Object.keys(parsed).reduce(function(x,k){
                return x + parsed[k].length
            }, 0);
            var content = Object.keys(parsed).reduce(function(x,k){
                return x + ' From ' + k + ': ' + parsed[k].join('. ') + '. '
            },'');
            var contact_num = Object.keys(parsed).length;
            var msg_output = msg_num == 0?'You have no new messages.':'You have '+ msg_num + ' message' + (msg_num>1?'s':'') +  ' from ' + (contact_num > 1? (contact_num + ' contacts'):Object.keys(parsed)[0]) +'. ';
            var speechOutput = msg_output + content;
            // var speechOutput = parsed.notifications.reduce(function(x,y) {
            //         return x + ' ' + y.app + ', ' + y.title + ', ' + y.content + '.'
            //     }, '');
            var repromptText = "hello?";
            var shouldEndSession = true;
            
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        });
        
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        context.done(null, 'FAILURE');
    });
}

function getTextingIntentResponse(intent, session, callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    console.log('****************************');
    console.log(JSON.stringify(session));
    console.log(JSON.stringify(intent));
    
    var recipient = 'Martin';
    if (intent.slots.recipient) {
        recipient = intent.slots.recipient.value || 'Martin';
        console.log('************** ' + intent.slots.recipient.value);
    }
    var body = 'nothing';
    if (intent.slots.body) {
        body = intent.slots.body.value || 'nothing';
        console.log('************** ' + intent.slots.body.value);
    }

//    callback(sessionAttributes,
//         buildSpeechletResponse({}, "You said " + body + ", Recipient is " + recipient, "say it again?", false));
//return;

    var textRequest = {
        'recipient': recipient,
        'message': body
    };
    var textRequestJsonStr = JSON.stringify(textRequest);
    console.log(JSON.stringify(textRequest));
    
    var req = https.request({
            hostname: 'alexa-whatsapp.herokuapp.com',
            path: '/message',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': textRequestJsonStr.length
            }
        },    
        function(res) {
            console.log("[whatsapp] Got response: " + res.statusCode);
            res.on('data', function() {
            });
            res.on('end', function() {
    
                var cardTitle = {};
                var speechOutput = 'Sent'
                var repromptText = "hello?";
                var shouldEndSession = true;
                
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            });
            
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
            context.done(null, 'FAILURE');
        });
    
    req.write(textRequestJsonStr);
    req.end();
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Bye!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
    exitSkill();
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
