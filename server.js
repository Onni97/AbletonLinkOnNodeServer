//setup express
const express = require('express');
const app = express();
const http = require('http').createServer(app);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});




//setup abletonlink-addon
const AbletonLink = require("abletonlink-addon");
const link = new AbletonLink();




//setup socket.io
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit("tempo", link.getTempo(true));
    socket.emit("numPeers", link.getNumPeers());
    socket.emit("startStopSyncEnabled", link.isStartStopSyncEnabled());
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

link.setNumPeersCallback((numPeers) => io.emit('numPeers', numPeers));
link.setTempoCallback((tempo) => io.emit('tempo', link.getTempo(true)));
link.setStartStopCallback((startStopState) => io.emit('playState', startStopState));

setInterval(() => {
    io.emit("beat", link.getBeat());
    io.emit("phase", link.getPhase());
}, 5);



http.listen(3000, () => {
    console.log('listening on *:3000');
});