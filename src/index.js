'use strict';

// External imports
const Alexa = require('alexa-sdk');
var https = require('https');
var sentiment = require('sentiment');
const request = require('request');
var path = require('path');
var express = require('express');
var async = require('async');

// Local imports
const Messages = require('./Messages');
const newsParser = require('./parseRSS');
// const WeatherHistory = require('./WeatherHistory');
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');

// STATES 
var states = {
    ASKMODE: '_ASKMODE'/* , // Alexa is asking user the questions.
    FACTMODE: '_FACTMODE' */
};
// Constants
var APP_ID = "amzn1.ask.skill.c01aa84b-63bf-4815-9d87-a3e3b7eb4d95";
/**
 * Another Possible value if you only want permissions for the country and postal code is:
 * read::alexa:device:all:address:country_and_postal_code
 * Be sure to check your permissions settings for your skill on https://developer.amazon.com/
 */
//////////////////
// INTERNAL VARS
////////////////

const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";
const PERMISSIONS = [ALL_ADDRESS_PERMISSION];


var apiKey = 'd6a006083d1746d8ba420632180708';
var currentCity = 'new york';
// let currentCity;

var today = new Date();
var years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
var dateString = today.toISOString().slice(4, 10);
var currentTime = today.getHours();

var todaysDate = today.toISOString().slice(0, 10);

var timeFrame;

if (currentTime < 3) {
    timeFrame = 0;
    // 12:00 am - 2:59 am

} else if (currentTime < 6) {
    timeFrame = 1
    // 3:00 am - 5:59 am

} else if (currentTime < 9) {
    timeFrame = 2
    // 6:00 am - 8:59 am

} else if (currentTime < 12) {
    timeFrame = 3
    // 9:00 am - 11:59 am

} else if (currentTime < 15) {
    timeFrame = 4
    // 12:00 pm - 2:59 pm

} else if (currentTime < 18) {
    timeFrame = 5
    // 3:00 pm - 5:59 pm

} else if (currentTime < 21) {
    timeFrame = 6
    // 6:00 pm - 8:59 pm

} else if (currentTime >= 21) {
    timeFrame = 7
    // 9:00 pm - 11:59 pm
}

var results = [];

var allTemperatures = []; // no need to export
var total = 0; // no need to export
var averageTemp;
var weatherSentiment;
let condition_new;
let currentTemp_new;
let count = 0;

console.log('Current Time is: ' + today.getHours());
console.log('Time frame is: ' + timeFrame);

var weather;
var temperture;
var ssmlOutput;

var sentiment1,
    sentiment2,
    sentiment3;

var AI_News;
var url = "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml";




var getSentiment__1 = function(){
    
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
    
        }
    });
}
getSentiment__1();







////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






// LOOP THRU PAST YEAR'S TEMPERaTURE AND GET AVERAGE TEMP
var getAverage = function () {

    return new Promise((resolve, reject) => {
    
        years.forEach( function (year, index) {
    
            var currentUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + year + dateString;
    
            request(currentUrl, function (error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (!error && response.statusCode == 200) {
                    var result = JSON.parse(body);
    
                    // console.log(result.data.weather[0]);
    
                    // GET AVERAGE TEMPERaTURE OF THE SAME DAY IN A SPAN OF LAST 9 YEARS
                    total = total + parseInt(result.data.weather[0].hourly[timeFrame].tempF); //27
                    averageTemp = total / years.length;
    
                    // GET AVERAGE TEMPERaTURE -- ANOTHER WAY
                    allTemperatures.push(parseInt(result.data.weather[0].hourly[timeFrame].tempF))
    
                    results[index] = result.data.weather[0];
    
                    // console.log('Average temp for last 9 years: ' + averageTemp);
    
                    count++;
    
                    if (count == years.length) {
                        console.log(`Average: ${averageTemp}`);
                    }
    
                } else {
                    console.log(error, response);
                }

                resolve(body);

                // console.log(allTemperatures);
                // console.log('Total_ ' + total);
                // console.log('Average Temperature: ' + index +': '+ averageTemp);
            });
        });
    })

}

getAverage();


// GET TODAY'S TEMP
var todaysWeather = function () {

    getAverage().then((b)=>{
        console.log(b.length);
        
        var currentUrl_2 = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + todaysDate;
    
        request(currentUrl_2, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
    
                currentTemp_new = result.data.weather[0].hourly[timeFrame].tempF;
                condition_new = result.data.weather[0].hourly[timeFrame].weatherDesc[0].value;
    
                console.log(`Today: ${todaysDate}`);
                console.log(`Location: ${result.data.request[0].query}`);
                console.log(`current temperature: ${currentTemp_new}`);
                console.log(`Weather Condition: ${condition_new}`);
    
                if (!validateWeatherCondition(condition_new)) {
                    // if validate comes out negative/false
                    weatherSentiment = 'bad';
                    sentiment2 = negativeSentiment2();
                    sentiment3 = negativeSentiment3();
                    console.log('Bad weather!');
    
                } else if (validateWeatherCondition(condition_new) && currentTemp_new > 62 && currentTemp_new < 87) {
                    // Ideal temperature
                    weatherSentiment = 'good';
                    sentiment2 = positiveSentiment2();
                    sentiment3 = positiveSentiment3();
                    console.log('Good weather! because current temperature is between 62 F and 87 F.');
    
                } else if (validateWeatherCondition(condition_new) && averageTemp <= 50 && currentTemp_new >= averageTemp + 10) {
                    // Winter Time
                    weatherSentiment = 'good';
                    sentiment2 = positiveSentiment2();
                    sentiment3 = positiveSentiment3();
                    console.log('Good weather! because current temperature is warmer than usual.');
    
                } else if (validateWeatherCondition(condition_new) && averageTemp >= 100 && currentTemp_new <= averageTemp - 10) {
                    // Summer Time
                    weatherSentiment = 'good';
                    sentiment2 = positiveSentiment2();
                    sentiment3 = positiveSentiment3();
                    console.log('Good weather! because current temperature is cooler than usual.');
    
                } else if (validateWeatherCondition(condition_new) && averageTemp <= 62 && currentTemp_new <= averageTemp - 10) {
                    // Winter Time
                    weatherSentiment = 'bad';
                    sentiment2 = negativeSentiment2();
                    sentiment3 = negativeSentiment3();
                    console.log('Bad weather! because current temperature is colder than usual.');
    
                } else if (validateWeatherCondition(condition_new) && averageTemp >= 87 && currentTemp_new >= averageTemp + 10) {
                    // Summer Time
                    weatherSentiment = 'bad';
                    sentiment2 = negativeSentiment2();
                    sentiment3 = negativeSentiment3();
                    console.log('Bad weather! because current temperature is hotter than usual.');
    
                } else {
                    weatherSentiment = 'so so';
                    sentiment2 = negativeSentiment2();
                    sentiment3 = 'so so. ';
                    console.log('Weather is so so');
                }
    
                // ssmlOutput = `${sentiment1} According to an article published today by Science Daily, <break time=\"0.3s\"/> ${AI_News.title}. <break time=\"0.6s\"/> ${sentiment2} the weather in ${currentCity} is ${sentiment3} It will be ${currentTemp_new} degrees and ${condition_new}.`
    
            } else {
                console.log(error, response);
            }
        });
    })
    .catch(reason => console.error(reason))

}

function validateWeatherCondition(cdt) {

    var con = cdt.toLowerCase();
    var validation;

    if (con.includes('rain', 'drizzle', 'light', 'thunder', 'showers', 'heavy', 'ice', 'snow', 'Patchy', 'extreme', 'freezing', 'intensity', 'shower', 'sleet', 'mist', 'fog', 'sand', 'dust', 'volcanic', 'ash', 'squalls', 'tornado', 'whirls', 'haze', 'smoke', 'tropical', 'ragged', 'storm', 'hurricane', 'cold', 'hot', 'windy', 'hail', 'severe', 'violent', 'thunderstorm', 'smoky', 'blustery', 'blowing', 'flurries')) {

        validation = false;

    } else {

        validation = true;
    }
    return validation;
}

/* 
// DEPRECATED

var checkTimer = setInterval(function () {
    if (count == years.length) {
        clearInterval(checkTimer);
        todaysWeather();

    } else {
        console.log('Waiting for getAverage() to finish...');
    }
}, 100); */






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context);

    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandler, askQuestionHandlers);
    alexa.execute();
    
    console.log(`Beginning execution for skill with APP_ID=${alexa.appId}`);
    console.log(`Ending execution  for skill with APP_ID=${alexa.appId}`);
};






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// START MODE  ///////////////////////
////////////////////////////////////////////////////////

var newSessionHandler = {

    'LaunchRequest': function () {
        this.handler.state = states.ASKMODE;

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

        deviceAddressRequest.then( (addressResponse) => {
            
            switch (addressResponse.statusCode) {

                case 200:

                    console.log( "Address successfully retrieved, now responding to user." );
                    
                    const address = addressResponse.address;
                    const ADDRESS_MESSAGE = 'Here is your address: ' + `${address['city']}`;
                    const assignCurrentCity = city => {
                        currentCity = city;
                    }
                    assignCurrentCity(address['city']);
                    todaysWeather();
                    getSentiment__1()
                    // getAverage();
                    // ssmlOutput = `${sentiment1} According to an article published today by Science Daily, <break time=\"0.3s\"/> ${AI_News.title}. <break time=\"0.6s\"/> ${sentiment2} the weather in ${currentCity} is ${sentiment3} It will be ${currentTemp_new} degrees and ${condition_new}.`

                    this.response.speak(Messages.WELCOME + Messages.WHAT_DO_YOU_WANT).listen(Messages.WHAT_DO_YOU_WANT);
                    this.emit(':responseReady');

                    break;

                case 204:
                    // This likely means that the user didn't have their address set via the companion app.
                    console.log("Successfully requested from the device address API, but no address was returned.");
                    this.emit(":tell", Messages.NO_ADDRESS);
                    break;

                case 403:
                    console.log("The consent token we had wasn't authorized to access the user's address.");
                    this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
                    // this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
                    break;

                default:
                    this.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
            }

            console.info("Ending getAddressHandler()");
        }).then(b=>{
            todaysWeather();
            
        })

        deviceAddressRequest.catch((error) => {
            this.emit(":tell", Messages.ERROR);
            console.error(error);
            console.info("Ending getAddressHandler()");
        });

        
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

        ssmlOutput = sentiment1 + 'According to an article published today by Science Daily, <break time=\"0.3s\"/>' + AI_News.title + ". <break time=\"0.6s\"/>" + sentiment2 + weather + sentiment3 + temperture + ' What other news would you like to hear?'

        this.response.speak(ssmlOutput).listen('are you there?')
        this.emit(':responseReady');
        
    },
    // 'Yes_Intent': function () {
    'GetAddress_Intent': function () {
        
        todaysWeather();
        
        // ssmlOutput = `${sentiment1} According to an article published today by 321 Science Daily, <break time=\"0.3s\"/> ${AI_News.title}. <break time=\"0.6s\"/> ${sentiment2} the weather in ${currentCity} is ${sentiment3} It will be ${currentTemp_new} degrees and ${condition_new}.`

        ssmlOutput = sentiment1 + 'According to an article published today by 321 Science Daily, <break time=\"0.3s\"/>' + AI_News.title + '. <break time=\"0.6s\"/>' + sentiment2 + ' the weather in ' + currentCity + 'is '+ sentiment3 + ' It will be ' + currentTemp_new + ' degrees and '+ condition_new + '.'

        this.response.speak(ssmlOutput + ' Would you like to hear another news? Say yes or no.').listen('Please say yes or no.')
        this.emit(':responseReady');
        
        // Prepare for next new A.I. news headline
        
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
function positiveSentiment2() {
  var sent2 = ["On the bright side, ", "Fortunately, ", "Delightfully, "];
  return sent2[getRandom(0, sent2.length - 1)]
}

function negativeSentiment2() {
  var sent2 = ["Sadly, ", "Unfortunately, "];
  return sent2[getRandom(0, sent2.length - 1)]
}

function positiveSentiment3() {
  var sent3 = ["great! ", "good. ", "awesome. ", "wonderful. ", "fabulous. ", "superb. ", "phenomenal. ", "beautiful. ", "charming. "];
  return sent3[getRandom(0, sent3.length - 1)]
}

function negativeSentiment3() {
  var sent3 = ["poor. ", "awful. ", "terrible. ", "miserable. ", "miserable. ", "daunting. "];
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