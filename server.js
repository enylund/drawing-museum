var http = require('http');
var path = require('path');

var io = require('socket.io');
var express = require('express');

// Configure the Express web server
var router = express();
var server = http.createServer(router);

// Tell Socket.IO to listen for websockets
var drawing_room = io.listen(server);

// Tell Express to serve static assets
router.use(express.static(path.resolve(__dirname, 'client')));

var picture = new Object();
var connectCounter = 0;
var imageURL = "http://cdn2.brooklynmuseum.org/images/opencollection/objects/size2/1994.156.1_bw.jpg";
var title = "Pedestal";
var artist = "Saarinen";
var creationDate = "1956";

drawing_room
  .on('connection', function(socket) {

  connectCounter++;

  drawing_room.sockets.emit('changeCount', connectCounter);
  drawing_room.sockets.emit('artworkInfo', imageURL, title, artist, creationDate);

  //imports info for each show page
  socket.on('channel', function(data) {
    channel_id = data;
    socket.emit('import', picture[channel_id]); 
  });  

  socket.on('onMouseDown', function(data) {
    socket.broadcast.emit("onMouseDown"+data.channel, data);
  });

  socket.on('onMouseDrag', function(data) {
    socket.broadcast.emit("onMouseDrag"+data.channel, data);
  });

  socket.on('onMouseUp', function(data) {
    socket.broadcast.emit("onMouseUp"+data.channel, data);
  });

  //gets JSON data and puts it into variable
  socket.on('update',function(data){
    picture[data.channel] = data.JSON;
  });

  socket.on('disconnect', function() {
    connectCounter--;
    drawing_room.sockets.emit('changeCount', connectCounter);
  });

  socket.on('title',function(data){
    socket.broadcast.emit("titleSubmit"+data.channel, data.title);
  });
});

server.listen(Number(process.env.PORT || 8888));


