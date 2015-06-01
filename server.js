// =================================================================
// get the packages we need ========================================
// =================================================================
var express     = require('express');
var app         = express();
var cors        = require('cors');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var morgan      = require('morgan');

var config      = require('./config'); // get our config file

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080; // port where app will be runing
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// seting up app to have cors
app.use(cors());
// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// TODO: move this to routes/default.js
// registering docs view
app.get('/api/docs',function(req,res){
    
    //console.log(__dirname);   
    res.sendFile(__dirname+'/app/static/templates/docs.html');

});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes 	= express.Router(),
	wordRoutes 	= express.Router(),
	tweetRoutes = express.Router(); 

// loading default routes
require('./app/routes/default.js')(app,apiRoutes);

// loading word routes
require('./app/routes/word.js')(app,wordRoutes);

// loading tweet routes
require('./app/routes/tweet.js')(app,tweetRoutes);

app.use('/api', apiRoutes);
app.use('/api', wordRoutes);
app.use('/api', tweetRoutes);

// Making prettier unauthorized method
app.use(function(err, req, res, next){
    if (err.constructor.name === 'UnauthorizedError') {
        res.status(401).send('Unauthorized');
    }
});

// Listening on port
app.listen(port, function () {
    console.log('listening on http://localhost:'+port);
});
