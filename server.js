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

app.get('/deviceSelectVendor', (req, res) => {
    fs.readFile(__dirname + '/pages/deviceSelectVendor.html', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            let stringToInsert = "";
            let keys = Object.keys(deviceLatencies);
            keys.forEach(function (item, index) {
                stringToInsert += '<div class="col colCard d-flex align-items-center">\n' +
                    '        <div class="card mx-auto" style="height: 0; width: 0" onclick="clicked(\'' + item + '\')">\n' +
                    '            <img class="card-img-top" src="/static/images/' + item + '.svg" alt="Card image cap">\n' +
                    '            <div class="card-body">\n' +
                    '                <h4 class="card-title">' + item + '</h4>\n' +
                    '            </div>\n' +
                    '        </div>\n' +
                    '    </div>';
            })
            let page = data.toString().replace("TO_REPLACE", stringToInsert);
            res.send(page);
        }
    });
});

app.get('/deviceSelectModel', (req, res) => {
    //TODO: risistemare il codice, in modo che ad ogni selezione si passino i dati e si salvino nella sessione
});

app.get('/link', (req, res) => {
    //da impostare la latenza;
    let latency = 0;
    fs.readFile(__dirname + '/pages/link.html', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            let page = data.toString().replace("LATECY_TO_REPLACE", latency);
            res.send(page);
        }
    });
});

app.get('/footer', (req, res) => {
    res.sendFile(__dirname + "/pages/footer.html");
});


//load device-latencies file
let deviceLatencies = require(__dirname + '/resources/device-latencies.json');


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


//start listening
http.listen(3000, () => {
    console.log('listening on port 3000');
});