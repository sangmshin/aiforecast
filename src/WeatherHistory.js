// EXTERNAL IMPORTS
var express = require('express');
var request = require('request');
var async = require('async');
var app = express();

// INTERNAL VARS
var apiKey = '7907268a25e44f4e9c335911180708';
var currentCity = 'hong kong';

// original
// var requestUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=new+york&tp=3&format=json&key=' + apiKey;

// modified
// var requestUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey;
// var requestUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=';


var today = new Date();
console.log(today);
var years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
var dateString = today.toISOString().slice(4, 10);
var currentTime = today.getHours();

var todaysDate = today.toISOString().slice(0, 10);

var timeFrame;

if(currentTime < 3){
    timeFrame = 0;
    // 12:00 am - 2:59 am

} else if (currentTime < 6){
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
var condition;
var weatherSentiment;
var currentTemp;
var count = 0;

console.log('Current Time is: '+ today.getHours());
console.log('Time frame is: ' + timeFrame);




// LOOP THRU PAST YEAR'S TEMPERaTURE AND GET AVERAGE TEMP
var getAverage = function(){

    years.forEach(function (year, index) {
        
        var currentUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + year + dateString;
        
        request(currentUrl, function (error, response, body) {
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
                
                if(count == years.length){
                    console.log(`Average: ${averageTemp}`);
                }

            } else {
                console.log(error, response);
            }
            // console.log(allTemperatures);
            // console.log('Total_ ' + total);
            // console.log('Average Temperature: ' + index +': '+ averageTemp);
        });
    }); 
}

getAverage();



// GET TODAY'S TEMP
var todaysWeather = function () {
    
    var currentUrl = 'https://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + encodeURIComponent(currentCity) + '&tp=3&format=json&key=' + apiKey + '&date=' + todaysDate;
    
    request(currentUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

            currentTemp = result.data.weather[0].hourly[timeFrame].tempF;
            condition = result.data.weather[0].hourly[timeFrame].weatherDesc[0].value;
            
            console.log(`Today: ${todaysDate}`);
            console.log(`Location: ${result.data.request[0].query}`);
            console.log('current temperature: ' + currentTemp);
            console.log(`Weather Condition: ${condition}`);



            if (!validateWeatherCondition(condition)){
                // if validate comes out negative/false
                weatherSentiment = 'bad';
                console.log('Bad weather!');

            } else if (validateWeatherCondition(condition) && currentTemp > 62 && currentTemp < 87) {
                // Ideal temperature
                weatherSentiment = 'good';
                console.log('Good weather! because current temperature is between 62 F and 87 F.');

            } else if (validateWeatherCondition(condition) && averageTemp <= 50 && currentTemp >= averageTemp+10 ){
                // Winter Time
                weatherSentiment = 'good';
                console.log('Good weather! because current temperature is warmer than usual.');
                
            } else if (validateWeatherCondition(condition) && averageTemp >= 100 && currentTemp <= averageTemp-10) {
                // Summer Time
                weatherSentiment = 'good';
                console.log('Good weather! because current temperature is cooler than usual.');

            } else if (validateWeatherCondition(condition) && averageTemp <= 62 && currentTemp <= averageTemp - 10) {
                // Winter Time
                weatherSentiment = 'bad';
                console.log('Bad weather! because current temperature is colder than usual.');

            } else if (validateWeatherCondition(condition) && averageTemp >= 87 && currentTemp >= averageTemp + 10) {
                // Summer Time
                weatherSentiment = 'bad';
                console.log('Bad weather! because current temperature is hotter than usual.');

            } else {
                weatherSentiment = 'so so';
                console.log('Weather is so so');
            }
            
        } else {
            console.log(error, response);
        }
    });
    
}

// todaysWeather();


function validateWeatherCondition(condition) {

    var con = condition.toLowerCase();
    var validation;

    if (con.includes('rain', 'drizzle', 'light', 'thunder', 'showers', 'heavy', 'ice', 'snow', 'Patchy', 'extreme', 'freezing', 'intensity', 'shower', 'sleet', 'mist', 'fog', 'sand', 'dust', 'volcanic', 'ash', 'squalls', 'tornado', 'whirls', 'haze', 'smoke', 'tropical', 'ragged', 'storm', 'hurricane', 'cold', 'hot', 'windy', 'hail', 'severe', 'violent', 'thunderstorm', 'smoky', 'blustery', 'blowing', 'flurries')){

        validation = false;

    } else {

        validation = true;
    }
    return validation;
}


var checkTimer = setInterval(function () {
    if (count == years.length) {
        clearInterval(checkTimer);
        todaysWeather();
        
    } else {
        console.log('Waiting for getAverage() to finish...');
    }
}, 1000);


/* 
async.waterfall(
    [
        function getAverage(callback) {

            years.forEach(function (year, index) {
                var currentUrl = requestUrl + '&date=' + year + dateString;

                request(currentUrl, function (error, response, body) {
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
                        console.log(`Average: ${averageTemp}`);
                        count++;
                        console.log(count);
                    } else {
                        console.log(error, response);
                    }
                    // console.log(allTemperatures);
                    // console.log('Total_ ' + total);
                    // console.log('Average Temperature: ' + index +': '+ averageTemp);
                });
            });
            callback(null, averageTemp)
        },

        function (averageTemp, callback) {
            var currentUrl = requestUrl + '&date=' + todaysDate;

            request(currentUrl, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var result = JSON.parse(body);

                    currentTemp = result.data.weather[0].hourly[timeFrame].tempF;
                    condition = result.data.weather[0].hourly[timeFrame].weatherDesc[0].value;

                    console.log(todaysDate);
                    console.log(result.data.request[0].query);
                    console.log('current temp: ' + currentTemp);
                    console.log(condition);



                    if (!validateWeatherCondition(condition)) {
                        // if validate comes out negative/false
                        weatherSentiment = 'bad';
                        console.log('Bad weather!');
                    } else if (validateWeatherCondition(condition) && currentTemp > 62 && currentTemp < 87) {
                        // if validate comes out positive/true
                        weatherSentiment = 'good';
                        console.log('Good weather because temperature is between 62 F and 87 F.');
                    } else if (validateWeatherCondition(condition) && averageTemp <= 50 && currentTemp >= averageTemp + 10) {
                        weatherSentiment = 'good';
                        console.log('Good weather! because temperature is warmer than usual.');

                    } else if (validateWeatherCondition(condition) && averageTemp >= 100 && currentTemp <= averageTemp - 10) {
                        weatherSentiment = 'good';
                        console.log('Good weather! because temperature is cooler than usual.');

                    } else if (validateWeatherCondition(condition) && averageTemp <= 62 && currentTemp <= averageTemp - 10) {
                        weatherSentiment = 'bad';
                        console.log('Bad weather! because temperature is colder than usual.');

                    } else if (validateWeatherCondition(condition) && averageTemp >= 87 && currentTemp >= averageTemp + 10) {
                        weatherSentiment = 'bad';
                        console.log('Bad weather! because temperature is hotter than usual.');

                    } else {
                        weatherSentiment = 'so so';
                        console.log('weather is so so');
                    }

                } else {
                    console.log(error, response);
                }
            });

            callback(null)
        }

    ],
    function (err) {
        // console.log('Final result' + averageTemp);
    }
);  */



module.exports = {
    "currentCity": currentCity,
    "currentTemp": currentTemp,
    "averageTemp": averageTemp,
    "weatherSentiment": weatherSentiment,
    "condition": condition,
    todaysWeather,
    getAverage

}