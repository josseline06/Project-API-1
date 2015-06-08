// app/routes/default.js
module.exports = function(app,apiRoutes) {

    // used to create, sign, and verify tokens
    var jwt         = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
    var expressJwt  = require('express-jwt'); //https://npmjs.org/package/express-jwt

    var User        = require('../models/user'); // get our mongoose model


    // http://localhost:8080/api
    // Welcome route
    apiRoutes.get('/', function(req, res) {
        res.json({ message: 'Welcome to the coolest API on earth!' });
    });

    // http://localhost:8080/api/authenticate
    // Send jwt to client
    apiRoutes.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found. ' + req.body.username});
            } else if (user) {

                // check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(user, app.get('superSecret'), {
                            expiresInMinutes: 60*24 // expires in 24 hours
                        });

                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    } else {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    }
                });
            }
        });
    });

    // this creates a simple user
    apiRoutes.route('/users')

        // create a user (accessed at POST http://localhost:8080/api/users)
        .post(function(req, res) {
            console.log('I\'m starting to create a new user');
            var user = new User();      // create a new instance of the user model
            console.log("I created the object");
            user.username = req.body.username;  // set the user username (comes from the request)
            user.password = req.body.password;
            user.name = req.body.name;
            user.lastname = req.body.lastname;
            console.log("apparently, I did it");
            console.log(user.username,user.password,user.name,user.lastname);

            // save the user and check for errors
            user.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'User created!' });
            });
        });

    // return information about that user
    apiRoutes.route('/users/:username')

        .get(function(req, res) {
            if (req.params.username != req.user.username){
                res.status(401).send('Wrong user');
            }else{
                User.findOne({username: req.params.username}, function(err, user) {
                    console.log(user);
                    if (err)
                        res.send(err);
                    res.json(user);
                });
            }
        })

        .put(function(req, res) {

            // use our word model to find the word we want
            User.findOne({username: req.params.username}, function(err, user) {

                if (err)
                    res.send(err);

                user.username = req.body.username;  // set the user username (comes from the request)
                user.password = req.body.password;
                user.name = req.body.name;
                user.lastname = req.body.lastname;
                console.log(user.username,user.password,user.name,user.lastname);

                // save the user and check for errors
                user.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'User updated!' });
                });

            });
        });

    

    // We are going to protect /api routes with JWT
    app.use('/api/users/:username', expressJwt({secret: app.get('superSecret')}));

}