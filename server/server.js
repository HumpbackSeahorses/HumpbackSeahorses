var port = process.env.PORT || 3000;

var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require('socket.io')(http);
var path = require('path');

var db = require('../db/db.js');
var Rooms = require('../db/models/Room.js');
var config = require('./config.js') || {};

var indexPage = path.resolve(__dirname + '../../public');

var translator = require('./translator.js');

app.use(express.static(indexPage));

io.on('connection', function(socket){
  //automatically connect new users to lobby
  socket.join('lobby');
  //console.log('a user connected!');
  socket.on('disconnect', function(){
    //console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    if(msg.room ===''){
      msg.room = 'lobby';
    }
    Rooms.findOne({room: msg.room}, function(err, room){
      if (err){
        console.log(err, ' error finding room!');
      }
      if (room === null){
        room = new Rooms({
          room: msg.room,
          lang: [msg.lang]
        })
      }
      if(room.lang.indexOf(msg.lang) === -1){
        room.lang.push(msg.lang);
      }
      room.save(function(err, room){
        console.log(room.lang.length);
        translator.translate(msg, room, function(err, results){
          msg.translations = results;
          socket.join(msg.room);
          console.log('broadcasted message: ', msg);
          io.to(msg.room).emit('chat message', msg);
        });
      });
    })
  });

  socket.on('leave room', function(room){
    // console.log(socket.adapter.rooms);
    socket.leave(room);
    // console.log('leaving room ->', room);
    // console.log('elvis has left the building!');
    // console.log(socket.adapter.rooms);
  });

  socket.on('join room', function(room){
    // console.log(socket.adapter.rooms);
    socket.join(room);
    // console.log('enter room ->', room);
    // console.log(socket.adapter.rooms);
  });

});

http.listen(port, function(){
  console.log('listening on *:', port);
});