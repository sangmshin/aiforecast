var AWS = require('aws-sdk');
var express = require('express');
var bodyParser = require('body-parser');
const reload = require('reload')
const path = require('path')
const fs = require('fs')

AWS.config.region = process.env.REGION


var app = express();


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());


// TEMPLATE ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')))


// ROUTES
app.use(require('./routes/index'))



var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});