// app/routes/word.js
module.exports = function(app,wordRoutes) {

    // used to create, sign, and verify tokens
    var jwt         = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
    var expressJwt  = require('express-jwt'); //https://npmjs.org/package/express-jwt

    var Word        = require('../models/word'); // get our mongoose model


    // http://localhost:8080/api/words
    wordRoutes.route('/words')

        // get all the words (accessed at GET http://localhost:8080/api/words)
        .get(function(req, res) {
            Word.find(function(err, words) {
                if (err)
                    res.send(err);

                res.json(words);
            });
            
        })

        // create a word (accessed at POST http://localhost:8080/api/words)
        .post(function(req, res) {
            Word.count({ text: req.body.text }, function (err, count) {
                if (err) 
                    res.send(err);

                if(count==0){
                    var word = new Word();
                    word.text = req.body.text;
                    word.feeling = req.body.feeling;
                    word.enabled = true;
                    word.last_user_id = null;
                    word.word_type = req.body.word_type;
                    console.log(word.text,word.feeling,word.word_type);

                    // save the word and check for errors
                    word.save(function(err) {
                        if (err)
                            res.send(err);

                        res.json({ message: 'Word created!' });
                    });
                }else{
                    res.send('Word already exists');
                }
            });

        });


    // on routes that end in /words/:word_text
    // ----------------------------------------------------
    wordRoutes.route('/words/:word_text')

        // get the word with that id (accessed at GET http://localhost:8080/api/word/:word_text)
        .get(function(req, res) {
            Word.findOne({text: req.params.word_text}, function(err, word) {
                if (err)
                    res.send(err);
                res.json(word);
            });
        })

        // update the word with this id (accessed at PUT http://localhost:8080/api/word/:word_text)
        .put(function(req, res) {

            // use our word model to find the word we want
            Word.findOne({text: req.params.word_text}, function(err, word) {

                if (err)
                    res.send(err);

                //word.text = req.body.text;
                word.feeling = req.body.feeling;
                word.enabled =  true;//req.body.enabled;
                word.last_user_id = req.user._id;
                console.log(word.text,word.feeling,word.word_type);

                // save the word
                word.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Word updated!' });
                });

            });
        })

        // delete the word with this id (accessed at DELETE http://localhost:8080/api/word/:word_text)
        .delete(function(req, res) {
            Word.findOne({text: req.params.word_text}, function(err, word) {

                word.enabled = false;
                word.last_user_id = req.user._id;

                // save the word
                word.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Word disabled!' });
                });
            });
            /*
            Word.remove({
                text: req.params.word_text
                //_id: req.params.word_id
            }, function(err, word) {
                if (err)
                    res.send(err);

                res.json({ message: 'Word successfully deleted' });
            });
            */
        });
    
    // We are going to protect /api/words routes with JWT
    app.use('/api/words', expressJwt({secret: app.get('superSecret')}));

}