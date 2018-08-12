'use strict';

// External imports
const Alexa = require('alexa-sdk');
var https = require('https');
var sentiment = require('sentiment');
const request = require('request');
var path = require('path')
/* request(url, function (err, response, body) {
    if (err) {
        console.log('error:', error);
    } else {
        console.log('body:', body);
    }
}); */
// Local imports
const Messages = require('./Messages');
const newsParser = require('./parseRSS');
const WeatherHistory = require('./WeatherHistory');
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');

/**
 * Another Possible value if you only want permissions for the country and postal code is:
 * read::alexa:device:all:address:country_and_postal_code
 * Be sure to check your permissions settings for your skill on https://developer.amazon.com/
 */
const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";

const PERMISSIONS = [ALL_ADDRESS_PERMISSION];

var weather;
var temperture;
var ssmlOutput;

var sentiment1,
    sentiment2,
    sentiment3;

var AI_News;
var url = "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml";


newsParser(url, function (err, feedItems) {
    if (!err) {
        
        // console.log("There are " + feedItems.length + " items in the feed.\n");
        // console.log(feedItems[0].title + ".\n");
        // console.log(feedItems[0].description + ".\n");
        // console.log(feedItems[0].link + ".\n");
        // console.log(feedItems[0].pubDate + ".\n");
        AI_News = feedItems[getRandom(0, 20)];
        
        console.log(AI_News.title);
        console.log(AI_News.description);
        console.log(sentiment(AI_News.title));
        console.log(sentiment(AI_News.description));

        var titleScore = sentiment(AI_News.title).score;
        var descScore = sentiment(AI_News.description).score;
        
        // console.log(titleScore + descScore);
        var totalScore = (titleScore + descScore) / 2;
        console.log('Sentiment Analysis Score : ' + totalScore);

        if (totalScore > 0) {

            sentiment1 = "The future is great! ";

        } else if (totalScore == 0) {

            sentiment1 = "It's a mixed bag. ";

        } else if (totalScore < 0) {

            sentiment1 = "Outlook not so good. ";

        }
        console.log(sentiment1);




        for (var i = 0; i < feedItems.length; i++) {
            //console.log ("Article Title: " + feedItems [i].title + ".\n");
        }
    }
});


var data = {
    "city": "los angeles",
    "state": "ca",
    "postcode": "10001"
}

const myAPI = {
    host: 'query.yahooapis.com',
    port: 443,
    path: `/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${encodeURIComponent(data.city)}%2C%20${data.state}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`,
    method: 'GET'
};


// console.log(data.city);
getWeather((localTime, currentTemp, currentCondition) => {
    // time format 10:34 PM
    // currentTemp 72
    // currentCondition, e.g.  Sunny, Breezy, Thunderstorms, Showers, Rain, Partly Cloudy, Mostly Cloudy, Mostly Sunny

    // sample API URL for Irvine, CA
    // https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22astoria%2C%20ny%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys

    weather = 'the weather in ' + data.city + ' is ';
    temperture = 'It will be ' + currentTemp + ' degrees and ' + currentCondition + '.';
});
// STATES 
var states = {
    ASKMODE: '_ASKMODE'/* , // Alexa is asking user the questions.
    FACTMODE: '_FACTMODE' */
};
// Constants
var APP_ID = "amzn1.ask.skill.c01aa84b-63bf-4815-9d87-a3e3b7eb4d95";

exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context);

    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandler, askQuestionHandlers);
    alexa.execute();
    
    console.log(`Beginning execution for skill with APP_ID=${alexa.appId}`);
    console.log(`Ending execution  for skill with APP_ID=${alexa.appId}`);
};

////////////////////////////////////////////////////////
//////////////////// START MODE  ///////////////////////
////////////////////////////////////////////////////////
var newSessionHandler = {

    'LaunchRequest': function () {
        this.handler.state = states.ASKMODE;

        this.response.speak(Messages.WELCOME + Messages.WHAT_DO_YOU_WANT).listen(Messages.WHAT_DO_YOU_WANT);
        this.emit(':responseReady');
    }
};

////////////////////////////////////////////////////////
///////////////////// ASK MODE  ////////////////////////
////////////////////////////////////////////////////////
var askQuestionHandlers = Alexa.CreateStateHandler(states.ASKMODE, {
    
    'GetNews_Intent' : function () {
        // this.handler.state = states.ASKMODE;
        
        // var cardContent = {
        //     smallImageUrl: "https://s3.amazonaws.com/deutscherlookup/d_logo_small_720x480.jpg",
        //     largeImageUrl: "https://s3.amazonaws.com/deutscherlookup/d_logo_large_1200x1200.jpg",
        // };

        sentiment2 = getRandomSentiment2();

        if (sentiment2 == "On the bright side, ") {

            var sentiment3 = positiveSentiment3();

        } else if (sentiment2 == "sadly, " || sentiment2 == "Unfortunately, ") {

            var sentiment3 = negativeSentiment3();
        }

        ssmlOutput = sentiment1 + 'According to an article published today by Science Daily, <break time=\"0.3s\"/>' + AI_News.title + ". <break time=\"0.6s\"/>" + sentiment2 + weather + sentiment3 + temperture + ' What other news would you like to hear?'

        this.response.speak(ssmlOutput).listen('are you there?')
        this.emit(':responseReady');
        
    },

    'GetAddress_Intent': function () {
        
        sentiment2 = getRandomSentiment2();

        if (sentiment2 == "On the bright side, ") {

            var sentiment3 = positiveSentiment3();

        } else if (sentiment2 == "sadly, " || sentiment2 == "Unfortunately, ") {

            var sentiment3 = negativeSentiment3();
        }

        ssmlOutput = sentiment1 + 'According to an article published today by Science Daily, <break time=\"0.3s\"/>' + AI_News.title + ". <break time=\"0.6s\"/>" + sentiment2 + weather + sentiment3 + temperture;



        const consentToken = this.event.context.System.user.permissions.consentToken;

        // If we have not been provided with a consent token, this means that the user has not
        // authorized your skill to access this information. In this case, you should prompt them
        // that you don't have permissions to retrieve their address.
        if (!consentToken) {
            this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);

            // Lets terminate early since we can't do anything else.
            console.log("User did not give us permissions to access their address.");
            console.info("Ending getAddressHandler()");
            return;
        }

        const deviceId = this.event.context.System.device.deviceId;
        const apiEndpoint = this.event.context.System.apiEndpoint;

        const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
        let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();

        deviceAddressRequest.then((addressResponse) => {
            switch (addressResponse.statusCode) {

                case 200:
                    console.log("Address successfully retrieved, now responding to user.");
                    const address = addressResponse.address;

                    // const ADDRESS_MESSAGE = Messages.ADDRESS_AVAILABLE +
                    //     `${address['addressLine1']}, ${address['city']}, ${address['stateOrRegion']}, ${address['postalCode']}`;
                    const ADDRESS_MESSAGE = 'Here is your address: ' + `${address['city']}`;

                    data.city = address['city'];
                    data.state = address['stateOrRegion'];

                    this.response.speak(ADDRESS_MESSAGE + ssmlOutput + ' What news do you want to hear?').listen('Are you there?')
                    this.emit(':responseReady');
                    

                    // this.emit(":tell", address['addressLine1']);
                    break;

                case 204:
                    // This likely means that the user didn't have their address set via the companion app.
                    console.log("Successfully requested from the device address API, but no address was returned.");
                    this.emit(":tell", Messages.NO_ADDRESS);
                    break;

                case 403:
                    console.log("The consent token we had wasn't authorized to access the user's address.");
                    this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
                    break;

                default:
                    this.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
            }

            console.info("Ending getAddressHandler()");
        });

        deviceAddressRequest.catch((error) => {
            this.emit(":tell", Messages.ERROR);
            console.error(error);
            console.info("Ending getAddressHandler()");
        });
    },

    'AMAZON.HelpIntent': function () {
        this.response.speak(Messages.HELP).listen(Messages.HELP);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(Messages.GOODBYE)
        this.emit(':responseReady');
    },
    "SessionEndedRequest": function () {
        this.emit("AMAZON.StopIntent");
    },
    "AMAZON.StopIntent": function () {
        // this.emit(":ask", Messages.STOP, Messages.STOP);
        this.response.speak(Messages.GOODBYE)
        this.emit(':responseReady');
    },

    'Unhandled': function () {
        var say = "say something proper!";
        this.response.speak(say).listen(say);
        this.emit(':responseReady');
    }
});



/////////////////////////////////////////////////////////////////////
///////////////////////  HELPER  ////////////////////////////////////
/////////////////////////////////////////////////////////////////////

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomSentiment1() {
  var sent1 = ["The future is great! ", "It's a mixed bag. ", "Outlook not so good. ", ""];
  return sent1[getRandom(0, sent1.length - 1)]
}

function getRandomSentiment2() {
  var sent2 = ["On the bright side, ", "sadly, ", "Unfortunately, "];
  return sent2[getRandom(0, sent2.length - 1)]
}
/* function getRandomSentiment3() {
  var sent3 = ["great! ", "good. ", "so so. ", "poor. "];
  return sent3[getRandom(0, sent3.length - 1)]
} */

function positiveSentiment3() {
  var sent3 = ["great! ", "good. "];
  return sent3[getRandom(0, sent3.length - 1)]
}

function negativeSentiment3() {
  var sent3 = ["so so. ", "poor. "];
  return sent3[getRandom(0, sent3.length - 1)]
}

function getRandomHeadline(headlines) {
  return getRandom(0, headlines.length - 1)
}


function getWeather(callback) {
//   var https = require('https');

  var req = https.request(myAPI, res => {
    res.setEncoding('utf8');
    var returnData = "";

    res.on('data', chunk => {
      returnData = returnData + chunk;
    });
    res.on('end', () => {
      var channelObj = JSON.parse(returnData).query.results.channel;

      var localTime = channelObj.lastBuildDate.toString();
      localTime = localTime.substring(17, 25).trim();

      var currentTemp = channelObj.item.condition.temp;

      var currentCondition = channelObj.item.condition.text;

      callback(localTime, currentTemp, currentCondition);

    });

  });
  req.end();
}