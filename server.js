//setup express
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/deviceSelect.html')
});

app.get('/deviceSelectPC-Mobile', (req, res) => {
    res.sendFile(__dirname + '/pages/deviceSelectPC-Mobile.html');
});

app.get('/link', (req, res) => {
    fs.readFile(__dirname + '/pages/index.html', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            let page = data.toString().replace("LATECY_TO_REPLACE", "0");
            res.send(page);
        }
    });
});




//setup abletonlink-addon
const AbletonLink = require("abletonlink-addon");
const link = new AbletonLink();




//setup socket.io
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    //console.log('A user connected');
    socket.emit("numPeers", link.getNumPeers());
    socket.emit("tempo", link.getTempo(true));
    socket.emit("startStopSyncEnabled", link.isStartStopSyncEnabled());
    socket.emit("beat", link.getBeat(true));
    socket.emit("phase", link.getPhase(true));
    socket.emit("latency", getDeviceLatency());
    socket.emit("handshakeOK");

    socket.on("print", (msg) => {
        console.log(msg);
    })
    socket.on('disconnect', () => {
        //console.log('A user disconnected');
    });
});

link.setNumPeersCallback((numPeers) => io.emit('numPeers', numPeers));
link.setTempoCallback((tempo) => io.emit('tempo', link.getTempo(true)));
link.setStartStopCallback((startStopState) => io.emit('playState', startStopState));

setInterval(() => {
    io.emit("beat", link.getBeat(true));
    io.emit("phase", link.getPhase(true));
}, 5);




let getDeviceLatency = function (deviceID) {

}


http.listen(3000, () => {
    console.log('listening on port 3000');
});