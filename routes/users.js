var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({err: err});
    }else{
      if(req.body.firstname){
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname){
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({err: err});
        }else{
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({status: "Registration successful", success: true});
          });
        }
      });
    }
  });
});

router.post('/login', passport.authenticate('local'), (req,res, next) => {
  var token = authenticate.getToken({id: req.user._id});
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({status: "Login successful", token: token, success: true});
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
