var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const abletonlink = require('abletonlink');

const port = process.env.PORT || 3000;




//setup express
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});




//setup ableton link
const link = new abletonlink();
link.enable();

link.on('tempo', (tempo) => io.emit('tempo', Math.round(tempo)));
link.on('numPeers', (numPeers) => io.emit('numPeers', numPeers));
link.on('playState', (playState) => io.emit('playState', playState));

link.startUpdate(10, (beat, phase, bpm) => {
    io.emit('beat', beat);
    io.emit('phase', phase)
    //console.log("updated", beat, phase, bpm)
});




//setup Socket.IO
io.on('connection', function(socket){
    //socket.emit("linkEnabled", link.isLinkEnable);
    socket.emit("tempo", link.bpm);
    socket.emit("numPeers", link.numPeers);
    socket.emit("playStateSync", link.isPlayStateSync);
});




//start server
http.listen(port, function(){
    console.log('\n');
    console.log('listening on port ' + port);
});
