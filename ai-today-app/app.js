

const express = require('express')
const app = express()
const reload = require('reload')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({
  extended: true
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(bodyParser.json());


// TEMPLATE ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')))


// ROUTES
app.use(require('./routes/index'))


// SERVER
app.listen(PORT, () => {
  console.log(`We are live and magic happens on port ${PORT}`);
})


// LIVERELOAD
reload(app, {
  verbose: true
})


// module.exports.server = sls(app)
