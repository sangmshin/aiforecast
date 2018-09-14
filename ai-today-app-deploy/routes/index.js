// 'use strict';

var express = require('express')
var router = express.Router();
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var https = require('https');
var request = require('request');
var results_json = require('../data/results.json');
var fs = require('fs');
var uc = require('upper-case')
var capitalize = require('capitalize')
var lowerCase = require('lower-case')

// Local imports
var newsParser = require('../parseRSS');


//Science Daily
var url = "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml";
var news_intro = "According to an A.I. article published today by Science Daily, "


// WEATHER HISTORY API KEY
var apiKey = '5d997944be7f4e34aa022837181208';
var currentCity;
// d98648111d75482e9e133424181108
// d6a006083d1746d8ba420632180708
// 7907268a25e44f4e9c335911180708
// 3116724450034216b5433851181108
// 5d997944be7f4e34aa022837181208


// WEATHER VARIABLES
var today = new Date();
var years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
var dateString = today.toISOString().slice(4, 10);
var currentTime = today.getHours();
var todaysDate = today.toISOString().slice(0, 10);
var timeFrame, timeFrame_detail;
var daytime, nighttime;


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

// DEFINE DAYTIME OR NIGHTTIME
if (timeFrame < 2 || timeFrame > 6) {
  daytime = true;
  nighttime = false;
} else {
  daytime = false;
  nighttime = true;
}


// Variables
var sentiment1, sentiment2, sentiment3;
// AI NEWS RSS FEED
var AI_News;
var results = [];
var allTemperatures = []; // no need to export
var total = 0; // no need to export
var averageTemp;
var weatherSentiment;
var condition_new;
var currentTemp_new;
var celsius;
var weatherIcon;
var news_isPositive, weather_isPositive;
var searched_location;
var weather, temperture;


console.log('\nCurrent Time is: ' + today.getHours(), '\n');
console.log('Time frame is: ' + timeFrame, ' ( ' + timeFrame_detail + ' ) ' + '\n');


// //////////////////
// MAIN FUNCTION 1 //
/////////////////////
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





/////////////////////
// MAIN FUNCTION 2 //
/////////////////////

// LOOP THRU PAST YEAR'S TEMPERaTURE AND GET AVERAGE TEMP
var getAverage = function () {

  // SET 'averageTemp' variable to 0 for next results
  averageTemp = 0;
  total = 0;

  var count = 0;

  years.forEach(function (year, index) {

    var currentUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + year + dateString;
    
    request(currentUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);

        // console.log(result.data.weather[0]);
        // console.log(result.data.weather[0]);

        // GET AVERAGE TEMPERaTURE OF THE SAME DAY IN A SPAN OF LAST 9 YEARS
        total = total + parseInt(result.data.weather[0].hourly[timeFrame].tempF); //27
        console.log('year count is: ', count);
        
        // averageTemp = total / years.length;
        averageTemp = total / (count + 1);

        // GET AVERAGE TEMPERaTURE -- ANOTHER WAY
        allTemperatures.push(parseInt(result.data.weather[0].hourly[timeFrame].tempF))

        results[index] = result.data.weather[0];

        console.log('Average temp for last 9 years: ' + averageTemp);

        count++;

        if (count == years.length) {
          console.log(`Average: ${averageTemp}`);
          // todaysWeather();
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





//////////////////////////
// MAIN FUNCTION 3 /////
////////////////////////

// GET TODAY'S TEMP
var todaysWeather = function () {

  var currentUrl = 'http://api.worldweatheronline.com/premium/v1/weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + todaysDate;

  request(currentUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);

      currentTemp_new = result.data.weather[0].hourly[timeFrame].tempF;
      condition_new = result.data.weather[0].hourly[timeFrame].weatherDesc[0].value;
      celsius = result.data.weather[0].hourly[timeFrame].tempC;
      searched_location = result.data.request[0].query;

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


      // WEATHER ICON GENERATE
      var con = lowerCase(condition_new)

      if (con.includes('sun')) {
        weatherIcon = 'wi-day-sunny'
      } else if (con.includes('rain') && daytime) {
        weatherIcon = 'wi-day-rain'
      } else if (con.includes('rain') && nighttime) {
        weatherIcon = 'wi-night-rain'
      } else if (con.includes('drizz')) {
        weatherIcon = 'wi-rain'
      } else if (con.includes('snow') && daytime) {
        weatherIcon = 'wi-day-snow'
      } else if (con.includes('snow') && nighttime) {
        weatherIcon = 'wi-night-snow'
      } else if (con.includes('cloud') && daytime) {
        weatherIcon = 'wi-day-cloudy'
      } else if (con.includes('cloud') && nighttime) {
        weatherIcon = 'wi-night-cloudy'
      } else if (con.includes('cloud') && con.includes('wind')) {
        weatherIcon = 'wi-cloudy-windy'
      } else if (con.includes('shower') && daytime) {
        weatherIcon = 'wi-day-showers'
      } else if (con.includes('shower') && nighttime) {
        weatherIcon = 'wi-night-showers'
      } else if (con.includes('fog') && daytime) {
        weatherIcon = 'wi-day-fog'
      } else if (con.includes('fog') && nighttime) {
        weatherIcon = 'wi-night-fog'
      } else if (con.includes('thunderstorm') && daytime) {
        weatherIcon = 'wi-day-thunderstorm'
      } else if (con.includes('thunderstorm') && nighttime) {
        weatherIcon = 'wi-night-thunderstorm'
      } else if (con.includes('hail') && daytime) {
        weatherIcon = 'wi-day-hail'
      } else if (con.includes('hail') && nighttime) {
        weatherIcon = 'wi-night-hail'
      } else if (con.includes('lightning')) {
        weatherIcon = 'wi-lightning'
      } else if (con.includes('sprinkle') && daytime) {
        weatherIcon = 'wi-day-sprinkle'
      } else if (con.includes('sprinkle') && nighttime) {
        weatherIcon = 'wi-night-sprinkle'
      } else if (con.includes('eclipse') && daytime) {
        weatherIcon = 'wi-solar-eclipse'
      } else if (con.includes('eclipse') && nighttime) {
        weatherIcon = 'wi-lunar-eclipse'
      } else if (con.includes('star')) {
        weatherIcon = 'wi-stars'
      } else if (con.includes('raindrop')) {
        weatherIcon = 'wi-raindrops'
      } else if (con.includes('sleet') && daytime) {
        weatherIcon = 'wi-day-sleet'
      } else if (con.includes('sleet') && nighttime) {
        weatherIcon = 'wi-night-sleet'
      } else if (con.includes('fire')) {
        weatherIcon = 'wi-fire'
      } else if (con.includes('volcano')) {
        weatherIcon = 'wi-volcano'
      } else if (con.includes('smog')) {
        weatherIcon = 'wi-smog'
      } else if (con.includes('flood')) {
        weatherIcon = 'wi-flood'
      } else if (con.includes('hurricane')) {
        weatherIcon = 'wi-hurricane'
      } else if (con.includes('gust')) {
        weatherIcon = 'wi-cloudy-gusts'
      } else if (con.includes('smoke')) {
        weatherIcon = 'wi-smoke'
      } else if (con.includes('dust')) {
        weatherIcon = 'wi-dust'
      } else if (con.includes('sandstorm')) {
        weatherIcon = 'wi-sandstorm'
      } else if (con.includes('meteor')) {
        weatherIcon = 'wi-meteor'
      } else if (con.includes('tornado')) {
        weatherIcon = 'wi-tornado'
      } else if (con.includes('snowflake')) {
        weatherIcon = 'wi-snowflake-cold'
      } else if (con.includes('quake')) {
        weatherIcon = 'wi-earthquake'
      } else if (con.includes('tsunami')) {
        weatherIcon = 'wi-tsunami'
      } else if (con.includes('advisor')) {
        weatherIcon = 'wi-small-craft-advisory'
      } else if (con.includes('warn')) {
        weatherIcon = 'wi-storm-warning'
      } else if (con.includes('sandstorm')) {
        weatherIcon = 'wi-sandstorm'
      } else if (con.includes('meteor')) {
        weatherIcon = 'wi-meteor'
      } else if (con.includes('humid')) {
        weatherIcon = 'wi-humidity'
      } else if (con.includes('sunrise')) {
        weatherIcon = 'wi-sunrise'
      } else if (con.includes('sunset')) {
        weatherIcon = 'wi-sunset'
      } else {
        weatherIcon = 'wi-na'
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





///////////////////////////////////
/// HELPER FUNCTION //////////////////////////////////// ////// ///
//////////////////////////////////


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




// HOME : LANDING PAGE
router.get('/', (req, res, next) => {
  res.render('index', {
    app_title: 'AI TODAY',
    welcome: `Welcome to<br/>
    < <span class="aitoday">A.I. Today</span> />`,
  })
})




// CREATE
router.post('/', (req, res, next) => {

  // RESET CURRENT TEMP;
  currentTemp_new = 0;
  weatherIcon = '';

  currentCity = req.body.location;

  getSentiment__1();

  var results = {
    location: currentCity
  };

  var renderer = async () => {

    var _averageTemp = await getAverage();
    await new Promise((resolve, reject) => setTimeout(resolve, 5000));
    todaysWeather();
    return _averageTemp;

  }

  renderer().then((_averageTemp) => {

    console.log('_averageTemp', _averageTemp);


    var checkTimer = setInterval(function () {

      if (currentTemp_new != '0' && weatherIcon != '') {

        
          var weatherPhrase = `
            weather in ${searched_location} will be ${sentiment3} It'll be ${currentTemp_new}\u2109 / ${celsius}\u2103 and ${lowerCase(condition_new)}.
          `

          console.log(weatherPhrase);
          console.log('new temperature received from', currentCity);

          clearInterval(checkTimer);

          var result = {
            location: currentCity
          };

          results_json.unshift(result);

          fs.writeFile('data/results.json', JSON.stringify(results_json), 'utf8', function (err) {
            if (err) {
              console.log(err);
            }
          });

          res.render('index', {
            app_title: 'A.I. Today',
            welcome: `Welcome to<br/>
            <&nbsp;<span class="aitoday">A.I.&nbsp;Today</span>&nbsp;/>`,
            sentiment1: sentiment1,
            news_intro: news_intro,
            AI_News: AI_News,
            sentiment2 : sentiment2,
            weatherPhrase: weatherPhrase,
            message: " name and message has been posted to MongoDB. Here is the POSTed results!",
            results: results,
            results_json: results_json,
            iconCSS: weatherIcon
          })

          return true;


      } else {
        console.log('Waiting for getAverage() to finish...');
      }
    }, 1000);

  })


});





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




module.exports = router;