const express = require('express')
const router = express.Router();
const bodyParser = require('body-parser');
var fs = require('fs');
var results_json = require('../data/results.json');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


router.post('/results', (req, res, next) => {
  console.log(req.body)

  res.send(`
    Here is the what you put in:<br/>
    First Name: ${req.body.firstName}<br/>
    Last Name: ${req.body.lastName}`)

})


// CREATE
app.post('/results', (req, res, next) => {


  const results = {
    location: req.body.location
  };

  // notes_json.unshift(note);
  // console.log(notes_json);


  fs.writeFile('data/results.json', JSON.stringify(results_json), 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });

  
  db.collection('ai_location').insert(results, (err, result) => {
    if (err) {
      res.send({
        'error': 'An error has occurred'
      });
    } else {
      console.log(result);

      res.render('results', {
        message: "Your name and message has been posted to MongoDB. Here is the POSTed results!",
        _result: result,
        results_json: results_json
      })
    }
  });
});