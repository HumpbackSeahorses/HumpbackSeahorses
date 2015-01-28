var msTranslator = require('mstranslator');
var config = require('./config.js');
var async = require('async');


var Translator = function(){};

// This generates translate functions for all languages in specified room,
// calls them in parallel, and executes callback on the results.
Translator.prototype.translate = function(msg, room, callback){
  var tasks = {};
  for(var i = 0; i < room.lang.length; i++){
    console.log(room.lang[i], ' from translate function');
    tasks[room.lang[i]] = this.makeTranslateQuery(msg.text, msg.lang, room.lang[i]);
  }
  async.parallel(tasks, function(err, results){
    callback(err, results);
  })
};

// this returns a function ready to be called with parameters set to
// values passed in. 
Translator.prototype.makeTranslateQuery = function(text, fromLang, toLang){
  var params = {
    text: text,
    from: fromLang,
    to: toLang
  };
  return function(callback){
    var client =  new msTranslator({
      client_id: process.env.CLIENT_ID || config.client_id,
      client_secret: process.env.CLIENT_SECRET || config.client_secret
    }, true);
    client.translate (params, function (err , data) {
      if(err){
        console.log(err)
      }
      else{
        callback (err, data);
      }
    });
  };
};

module.exports = new Translator();