const router = require('express').Router();
var passport = require('passport');

var UserCntrl = require('../controllers/user');
var settings = require('../config/settings');
var User = require('../models/user');
var jwt = require('jsonwebtoken');

// Respond to requests on root for check-alive.
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

// Register a new user by username,password.
router.post('/register', function(req, res) {
  if (!req.body.username || !req.body.password || !req.body.name) {
    res.json({success: false, msg: 'Please pass name, username,  and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        console.log(err);
        return res.json({success: false, msg: 'Username already exists.'});

      }
      console.log('save success');
      res.json({success: true, msg: 'Successful created new user.'});

    });

  }
});

// Login via username and password to get auth token.
router.post('/login', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), settings.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token, username: user.username, name: user.name});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// Handle User based routes
router.get('/users', passport.authenticate('jwt', { session: false}), UserCntrl.list); // List all users
router.post('/user', UserCntrl.post); // Create a user (Register)
router.get('/user', passport.authenticate('jwt', { session: false}), UserCntrl.get); // Get a user
router.put('/user', passport.authenticate('jwt', { session: false}), UserCntrl.put); // Update a user
router.delete('/user', passport.authenticate('jwt', { session: false}), UserCntrl.delete); // Delete a user


module.exports = router;
