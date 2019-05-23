var express = require('express');
const bodyParser = require('body-parser');
var Users = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  //return Users.findOne({}).then((users) => )
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  console.log(`Username ${req.body.username} + ${req.body.password}`);
  Users.findOne({username: req.body.username})
  .then((user) => {
    if(user != null){
      var err = new Error(`User ${req.body.username} already exists`);
      err.status = 403;
      return next(err);
    }else{
      return Users.create({username: req.body.username, password: req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({status: "Registration successful", user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req,res, next) => {
  if(req.session.user){
    res.status = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are authenticated');
  }

  var authHeader = req.headers.authorization;
  if(!authHeader){
    var err = new Error("You are not authenticated");
    res.setHeader('WWW-AUTHENTICATE', 'Basic');
    err.status = 401;
    return next(err);
  }

  var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  var username = auth[0];
  var password = auth[1];

  Users.findOne({username: username})
  .then((user) => {
    if(user === null){
      var err = new Error(`User ${user.username} does not exist`);
      res.setHeader('WWW-AUTHENTICATE', 'Basic');
      err.status = 403;
      return next(err);
    }else if(user.password != password){
      var err = new Error(`Your password is incorrect`);
      res.setHeader('WWW-AUTHENTICATE', 'Basic');
      err.status = 403;
      return next(err);
    }else{
      req.session.user = 'authenticated';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are authenticated');
    }
  }).catch((err) => next(err));
});

router.get('/logout', (req, res) => {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }else {
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
