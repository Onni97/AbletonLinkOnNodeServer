//setup express
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const session = require('express-session');

app.use('/static', express.static(__dirname + '/static'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    'secret': 'hbjsv86sf78vhwebuv73928ubfe8r9fu3ibhnsku2f398',
    'resave': false,
    'saveUninitialized': true
}));


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
            keys.forEach(function (item) {
                stringToInsert += '<div class="col colCard d-flex align-items-center">\n' +
                    '        <div class="card mx-auto" style="opacity: 0" onclick="clicked(\'' + item + '\')">\n' +
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
    fs.readFile(__dirname + '/pages/deviceSelectModel.html', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            let stringToInsert = "";
            let keys = Object.keys(deviceLatencies[req.query.vendor]);
            keys.forEach(function (item) {
                stringToInsert += '<div class="col colCard d-flex align-items-center">\n' +
                    '        <div class="card noPhoto mx-auto" style="opacity: 0" onclick="clicked(\'' + item + '\')">\n' +
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

app.get('/deviceSelectVersion', (req, res) => {
    fs.readFile(__dirname + '/pages/deviceSelectVersion.html', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            let stringToInsert = "";
            let keys = Object.keys(deviceLatencies[req.query.vendor][req.query.model]);
            keys.forEach(function (item) {
                stringToInsert += '<div class="col colCard d-flex align-items-center">\n' +
                    '        <div class="card noPhoto mx-auto" style="opacity: 0" onclick="clicked(\'' + item + '\')">\n' +
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

app.post('/setDevice', (req, res) => {
    if (req.body.isPC === "true") {
        req.session.deviceLatency = 0;
        res.sendStatus(200);
    } else {
        //TODO: controllare se funziona
        req.session.deviceLatency = deviceLatencies[req.body.vendor][req.body.model][req.body.version]/2000;
        res.sendStatus(200);
    }
});


app.get('/link', (req, res) => {
    let deviceLatency = req.session.deviceLatency;
    if (deviceLatency === undefined) {
        res.redirect("/");
    } else {
        fs.readFile(__dirname + '/pages/link.html', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let page = data.toString().replace("LATECY_TO_REPLACE", deviceLatency);
                res.send(page);
            }
        });
    }
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
    socket.emit("numPeers", link.getNumPeers());
    socket.emit("tempo", link.getTempo(true));
    socket.emit("startStopSyncEnabled", link.isStartStopSyncEnabled());
    socket.emit("beat", link.getBeat());
    socket.emit("phase", link.getPhase());
    socket.emit("handshakeOK");

    socket.on("print", (msg) => {
        console.log(msg);
    })
    socket.on('disconnect', () => {
    });
});

link.setNumPeersCallback((numPeers) => io.emit('numPeers', numPeers));
link.setTempoCallback((tempo) => io.emit('tempo', link.getTempo(true)));
link.setStartStopCallback((startStopState) => io.emit('playState', startStopState));

setInterval(() => {
    io.emit("beat", link.getBeat());
    io.emit("phase", link.getPhase());
}, 5);


//start listening
http.listen(3000, () => {
    console.log('listening on port 3000');
});