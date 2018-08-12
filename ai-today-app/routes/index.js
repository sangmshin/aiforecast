'use strict';

const express = require('express')
const router = express.Router();
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
const bodyParser = require('body-parser');
var https = require('https');
const request = require('request');
var results_json = require('../data/results.json');
var fs = require('fs');
var uc = require('upper-case')
var capitalize = require('capitalize')
var lowerCase = require('lower-case')

// Local imports
const newsParser = require('../parseRSS');


var sentiment1, sentiment2, sentiment3;


// AI NEWS RSS FEED
var AI_News;

//Science Daily
var url = "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml";
var news_intro = "According to an A.I. article published today by Science Daily, "
// MASHABLE - includes image and video
// var url = "https://mashable.com/category/artificial-intelligence/feed/";

// REGISTER NEWS - GOOD
// var url = "https://www.theregister.co.uk/emergent_tech/artificial_intelligence/headlines.atom";


// WEATHER HISTORY API KEY
var apiKey = '3116724450034216b5433851181108';
var currentCity;
// d98648111d75482e9e133424181108
// d6a006083d1746d8ba420632180708
// 7907268a25e44f4e9c335911180708
// 3116724450034216b5433851181108




// OPENWEATHERMAP API KEY
// const OWM_apiKey = '32ce59c39474f053ef1299883e547d9d';


// WEATHER VARIABLES
var today = new Date();
var years = [2016, 2017];
var dateString = today.toISOString().slice(4, 10);
var currentTime = today.getHours();
var todaysDate = today.toISOString().slice(0, 10);
var timeFrame, timeFrame_detail;


// TIMEFRAME
if (currentTime < 3) {
  timeFrame = 0;
  timeFrame_detail = '12:00 am - 2:59 am'

} else if (currentTime < 6) {
  timeFrame = 1;
  timeFrame_detail = '3:00 am - 5:59 am'

} else if (currentTime < 9) {
  timeFrame = 2;
  timeFrame_detail = '6:00 am - 8:59 am'

} else if (currentTime < 12) {
  timeFrame = 3;
  timeFrame_detail = '9:00 am - 11:59 am'

} else if (currentTime < 15) {
  timeFrame = 4;
  timeFrame_detail = '12:00 pm - 2:59 pm'

} else if (currentTime < 18) {
  timeFrame = 5;
  timeFrame_detail = '3:00 pm - 5:59 pm'

} else if (currentTime < 21) {
  timeFrame = 6;
  timeFrame_detail = '6:00 pm - 8:59 pm'

} else if (currentTime >= 21) {
  timeFrame = 7;
  timeFrame_detail = '9:00 pm - 11:59 pm'
}

var results = [];
var allTemperatures = []; // no need to export
var total = 0; // no need to export
var averageTemp;
var weatherSentiment;
let condition_new;
let currentTemp_new;
let celsius;
let news_isPositive, weather_isPositive;
// let count = 0;

console.log('\nCurrent Time is: ' + today.getHours(), '\n');
console.log('Time frame is: ' + timeFrame, ' ( ' + timeFrame_detail + ' ) ' + '\n');

var weather, temperture;


// RSS FEED AND SENTIMENT ANALYSIS
var getSentiment__1 = function () {

  newsParser(url, (err, feedItems) => {
    if (!err) {

      AI_News = feedItems[getRandom(0, 30)];

      console.log('Article Total: ', feedItems.length);
      console.log('Article Index: ', feedItems.indexOf(AI_News));

      console.log('\n', AI_News.title, '\n');
      console.log(AI_News.description, '\n');
      console.log('Title Score: ', sentiment.analyze(AI_News.title).score, '\n');
      console.log('Body Score: ', sentiment.analyze(AI_News.description).score, '\n');


      var titleScore = sentiment.analyze(AI_News.title).score;
      var descScore = sentiment.analyze(AI_News.description).score;

      var totalScore = (titleScore + descScore) / 2;
      console.log('Sentiment Analysis Score : ' + totalScore, '\n');

      if (totalScore > 0) {

        sentiment1 = "The future is great! ";
        news_isPositive = true;

      } else if (totalScore == 0) {

        sentiment1 = "It's a mixed bag. ";
        news_isPositive = null;

      } else if (totalScore < 0) {

        sentiment1 = "Outlook not so good. ";
        news_isPositive = false;

      }
      console.log('Sentiment 1: ', sentiment1, '\n');

    }
  });
}
// ACTIVATE RSS FEED AND GET SENTIMENT
// getSentiment__1();






// LOOP THRU PAST YEAR'S TEMPERaTURE AND GET AVERAGE TEMP
var getAverage = function () {

  // SET 'averageTemp' variable to 0 for next results
  averageTemp = 0;
  total = 0;

  let count = 0;

  years.forEach(function (year, index) {

    var currentUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + year + dateString;

    request(currentUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);

        // console.log(result.data.weather[0]);
        // console.log(result.data.weather[0]);

        // GET AVERAGE TEMPERaTURE OF THE SAME DAY IN A SPAN OF LAST 9 YEARS
        total = total + parseInt(result.data.weather[0].hourly[timeFrame].tempF); //27
        averageTemp = total / years.length;

        // GET AVERAGE TEMPERaTURE -- ANOTHER WAY
        allTemperatures.push(parseInt(result.data.weather[0].hourly[timeFrame].tempF))

        results[index] = result.data.weather[0];

        console.log('Average temp for last 9 years: ' + averageTemp);

        count++;

        if (count == years.length) {
          console.log(`Average: ${averageTemp}`);
          todaysWeather();
        }

      } else {
        console.log(error, response);
      }
    });
  });
  return averageTemp;
}
// GET AVERAGE TEMPERTURE FOR LAST 9 YEARS
// getAverage();


// GET TODAY'S TEMP
var todaysWeather = function () {

  var currentUrl = 'http://api.worldweatheronline.com/premium/v1/weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + todaysDate;

  request(currentUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);

      currentTemp_new = result.data.weather[0].hourly[timeFrame].tempF;
      condition_new = result.data.weather[0].hourly[timeFrame].weatherDesc[0].value;
      celsius = result.data.weather[0].hourly[timeFrame].tempC;

      console.log(`Today: ${todaysDate}`);
      console.log(`Location: ${result.data.request[0].query}`);
      console.log('current temperature: ' + currentTemp_new);
      console.log('Celcius: ', result.data.weather[0].hourly[timeFrame].tempC);
      
      console.log(`Weather Condition: ${condition_new}`);


      // VALIDATE TODAY'S WEATHER
      if (!validateWeatherCondition(condition_new)) {
        // if validate comes out negative/false
        weatherSentiment = 'bad';
        console.log('Bad weather!');
        sentiment3 = negativeSentiment3()

      } else if (validateWeatherCondition(condition_new) && currentTemp_new > 62 && currentTemp_new < 87) {
        // Ideal temperature
        weatherSentiment = 'good';
        sentiment3 = positiveSentiment3()
        console.log('Good weather! because current temperature is between 62 F and 87 F.');

      } else if (validateWeatherCondition(condition_new) && averageTemp <= 50 && currentTemp_new >= averageTemp + 10) {
        // Winter Time
        weatherSentiment = 'good';
        sentiment3 = positiveSentiment3()
        console.log('Good weather! because current temperature is warmer than usual.');

      } else if (validateWeatherCondition(condition_new) && averageTemp >= 100 && currentTemp_new <= averageTemp - 10) {
        // Summer Time
        weatherSentiment = 'good';
        sentiment3 = positiveSentiment3()
        console.log('Good weather! because current temperature is cooler than usual.');

      } else if (validateWeatherCondition(condition_new) && averageTemp <= 62 && currentTemp_new <= averageTemp - 10) {
        // Winter Time
        weatherSentiment = 'bad';
        sentiment3 = negativeSentiment3()
        console.log('Bad weather! because current temperature is colder than usual.');

      } else if (validateWeatherCondition(condition_new) && averageTemp >= 87 && currentTemp_new >= averageTemp + 10) {
        // Summer Time
        weatherSentiment = 'bad';
        sentiment3 = negativeSentiment3()
        console.log('Bad weather! because current temperature is hotter than usual.');

      } else {
        weatherSentiment = 'so so';
        sentiment3 = 'so so.'
        console.log('Weather is so so');
      }


      // GET SENTIMENT 2
      if (news_isPositive && weatherSentiment == 'good') {
        sentiment2 = positiveSentiment2()
        console.log('Sentiment 2: ', sentiment2);

      } else if (news_isPositive && weatherSentiment == 'bad') {
        sentiment2 = goodToBadSentiment2()
        console.log('Sentiment 2: ', sentiment2);

      } else if (!news_isPositive && weatherSentiment == 'good') {
        sentiment2 = badToGoodSentiment2()
        console.log('Sentiment 2: ', sentiment2);

      } else if (!news_isPositive && weatherSentiment == 'bad') {
        sentiment2 = negativeSentiment2()
        console.log('Sentiment 2: ', sentiment2);

      } else if (news_isPositive == null && weatherSentiment == 'good') {
        sentiment2 = positiveSentiment2()
        console.log('Sentiment 2: ', sentiment2);

      } else if (news_isPositive == null && weatherSentiment == 'bad') {
        sentiment2 = negativeSentiment2()
        console.log('Sentiment 2: ', sentiment2);

      } else if (news_isPositive == null && weatherSentiment == 'so so') {
        sentiment2 = neutralSentiment2();
        console.log('Sentiment 2: ', sentiment2);

      } else if (news_isPositive && weatherSentiment == 'so so') {
        sentiment2 = badToGoodSentiment2();
        console.log('Sentiment 2: ', sentiment2);

      } else if (!news_isPositive && weatherSentiment == 'so so') {
        sentiment2 = negativeSentiment2();
        console.log('Sentiment 2: ', sentiment2);

      } else {
        sentiment2 = ''
        console.log('No sentiment2.');
      }

    } else {
      console.log(error, response);
    }
  });
}


// WEATHER VALIDATION
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



// var checkTimer = setInterval(function () {
//   if (count == years.length) {
//       clearInterval(checkTimer);
//       todaysWeather();

//   } else {
//       console.log('Waiting for getAverage() to finish...');
//   }
// }, 1000);

// todaysWeather();

////////////////////////////////////////////////
// BELOW YAHOO WEATHER API IS NO LONGER NEEDED
////////////////////////////////////////////////
var data = {
  "city": "los angeles",
  "state": "CA"
}
const myAPI = {
  host: 'query.yahooapis.com',
  port: 443,
  path: `/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${encodeURIComponent(data.city)}%2C%20${data.state}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`,
  method: 'GET'
};
// getWeather((localTime, currentTemp, currentCondition) => {

//   weather = 'the weather in ' + data.city + ' is ';
//   temperture = 'It will be ' + currentTemp + ' degrees and ' + currentCondition + '.';
//   // console.log(`${weather} ${temperture}`);
// });

// function getWeather(callback) {

//   var req = https.request(myAPI, res => {
//     res.setEncoding('utf8');
//     var returnData = "";

//     res.on('data', chunk => {
//       returnData = returnData + chunk;
//     });
//     res.on('end', () => {
//       var channelObj = JSON.parse(returnData).query.results.channel;

//       var localTime = channelObj.lastBuildDate.toString();
//       localTime = localTime.substring(17, 25).trim();

//       var currentTemp = channelObj.item.condition.temp;

//       var currentCondition = channelObj.item.condition.text;

//       callback(localTime, currentTemp, currentCondition);
//     });
//   });
//   req.end();
// }
////////////////////////////////////////////////
// ABOVE YAHOO WEATHER API IS NO LONGER NEEDED
////////////////////////////////////////////////




// HOME : LANDING PAGE
router.get('/', (req, res, next) => {
  res.render('index', {
    app_title: 'AI TODAY',
    welcome: 'Welcome to AI TODAY!',
    // sentiment: sentiment1,
    // AI_News: AI_News
  })
})



// CREATE
router.post('/', (req, res, next) => {

  // RESET CURRENT TEMP;
  currentTemp_new = 0;

  req.on('data', (data)=>{
    console.log('request data', data);
    
    
  })
  currentCity = req.body.location;

  getSentiment__1();
  // getAverage();

  const results = {
    location: req.body.location
  };

  var renderer = async () => {

    await getAverage();
    await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  }

  renderer().then((_averageTemp) => {
    
    var checkTimer = setInterval(function () {
      
      if (currentTemp_new != '0') {

        var weatherPhrase = `
          ${sentiment2} weather in ${uc(currentCity)} will be ${sentiment3} It'll be ${currentTemp_new}\u2109 / ${celsius}\u2103 and ${lowerCase(condition_new)}.
        `
        console.log(weatherPhrase);
        console.log('new temperature received from', currentCity);

        clearInterval(checkTimer);

        const result = {
          location: currentCity
        };
    
        results_json.unshift(result);

        fs.writeFile('data/results.json', JSON.stringify(results_json), 'utf8', function (err) {
          if (err) {
            console.log(err);
          }
        });

        res.render('index', {
          app_title : 'A.I. Today',
          welcome : 'Welcome to A.I. Today!',
          sentiment : sentiment1,
          news_intro : news_intro,
          AI_News : AI_News,
          weatherPhrase : weatherPhrase,
          message : " name and message has been posted to MongoDB. Here is the POSTed results!",
          results : results,
          results_json : results_json
        })

        return true;
        
      } else {
        console.log('Waiting for getAverage() to finish...');
      }
    }, 1000);
    
  })


  // db.collection('ai_location').insert(results, (err, result) => {
  //   if (err) {
  //     res.send({
  //       'error': 'An error has occurred'
  //     });
  //   } else {
  //     console.log(result);

  //     res.render('results', {
  //       message: "Your name and message has been posted to MongoDB. Here is the POSTed results!",
  //       _result: result,
  //       results_json: results_json
  //     })
  //   }
  // });
});



// ANOTHER WEATHER API BY OPENWEATHERMAP
// CURRENTLY NOT USING
// too simple
// router.post('/post', function (req, res) {
//   let city = req.body.location;
//   let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${OWM_apiKey}`

//   request(url, function (err, response, body) {
//     if(err){
//       res.render('index', {error: 'Error, please try again'});
//     } else {
//       let weather = JSON.parse(body)
//       if(weather.main == undefined){
//         res.render('index', {error: 'Error, please try again'});
//       } else {
//         let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
//         console.log(weather);
//         console.log(weather.main);
        
//         res.render('index', {weather: weatherText});
//       }
//     }
//   });
// })


///////////////////////  HELPER FUNCTION ////////////////////////////////////

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function positiveSentiment2() {
  var sent2 = ["On top of the good news, ", "Over and above that, ", "In addition to that, ", "Furthermore, ", "Along with that, ", "At the same time, ", "Simultaneously, ", "Coupled with the good news, ", "In conjunction with that, ", "Correspondingly, ", "In like manner, ", "Superior to the good news, ", "By the same token, ", "Likewise, "];
  return sent2[getRandom(0, sent2.length - 1)]
}

function goodToBadSentiment2() {
  var sent2 = ["Contrastingly, ", "sadly, ", "Unfortunately, ", "On the other hand, ", "In reverse, ", "Vice versa, ", "Asymmetrically, ", "Conflictingly, ", "Oppositely, ", "Conversely, ", "On the contrary, ", "Cheerlessly, ", "Dismally, ", "Sorrowfully, ", "Gloomily, ", "Woefully, ", "Badly, ", "Unhappily, ", "Awkwardly, ", "Poorly, ", "Weakly, ", "Clumsily, ", "Unfavorably, ", "Awfully, ", "Unluckily", "Upside down, "];
  return sent2[getRandom(0, sent2.length - 1)]
}

function badToGoodSentiment2() {
  var sent2 = ["Contrastingly, ", "On the brightside, ", "Fortunately, ", "On the other hand, ", "In reverse, ", "Vice versa, ", "Uniquely, ", "Asymmetrically, ", "Conflictingly, ", "Oppositely, ", "Conversely, ", "On the contrary, "];
  return sent2[getRandom(0, sent2.length - 1)]
}


function negativeSentiment2() {
  var sent2 = ["Sadly, ", "Unfortunately, ", "Cheerlessly, ", "Dismally, ", "Sorrowfully, ", "Gloomily, ", "Woefully, ", "Badly, ", "Unhappily, ", "Awkwardly, ", "Poorly, ", "Weakly, ", "Clumsily, ", "Unfavorably, ", "Awfully, ", "Unluckily"];
  return sent2[getRandom(0, sent2.length - 1)]
}

function neutralSentiment2() {
  var sent2 = ["Along with that, ", "Weakly, ", "Unfavorably, ", "And", "Also, ", "At the same time, ", "Simultaneously, ", "By the same token, ", "At the same time, "];
  return sent2[getRandom(0, sent2.length - 1)]
}


function positiveSentiment3() {
  var sent3 = ["great. ", "good. ", "awesome. ", "wonderful. ", "fabulous. ", "superb. ", "phenomenal. ", "beautiful. ", "charming. ", "superior. ", "excellent. ", "nice. ", "exciting. ", "amazing. ", "prime. ", "gnarly. ", "ace. ", "satisfying. ", "marvelous. ", "splendid. ", "peaceful. ", "pleasant. ", "overjoyed. ", "blessed. ", "gleeful. ", "looking good. ", "lively. ", "thrilled. ", "ecstatic. "];
  return sent3[getRandom(0, sent3.length - 1)]
}

function negativeSentiment3() {
  var sent3 = ["poor. ", "awful. ", "terrible. ", "miserable. ", "gloomy. ", "daunting. ", "unhappy. ", "ordinary. ", "unsatisfactory. ", "unhelpful. ", "unpleasant. ", "misbehaving. ", "down. ", "depressed. ", "unfriendly. ", "dissatisfied. ", "discouraged. ", "disturbed. "];
  return sent3[getRandom(0, sent3.length - 1)]
}

function getRandomSentiment2() {
  var sent2 = ["On the bright side, ", "sadly, ", "Unfortunately, "];
  return sent2[getRandom(0, sent2.length - 1)]
}



module.exports = router;