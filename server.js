//SETUP EXPRESS
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const session = require('express-session');
const options = {
    key: fs.readFileSync(__dirname + '/resources/key.pem'),
    cert: fs.readFileSync(__dirname + '/resources/cert.pem')
};
const https = require("https");
app.use('/static', express.static(__dirname + '/static'));
let server = https.createServer(options, app);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    'secret': 'hbjsv86sf78vhwebuv73928ubfe8r9fu3ibhnsku2f398',
    'resave': false,
    'saveUninitialized': true
}));


//load device-latencies.json file
let deviceLatencies = require(__dirname + '/resources/device-latencies.json');


//the initial page allows to select the device
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/deviceSelect.html');
});

//subpage to show the choice PC-Mobile
app.get('/deviceSelectPC-Mobile', (req, res) => {
    res.sendFile(__dirname + '/pages/deviceSelectPC-Mobile.html');
});

//subpage to select the model
app.get('/deviceSelectModel', (req, res) => {
    res.sendFile(__dirname + '/pages/deviceSelectModel.html');
});

//page that returns a limited number of models for implementing the infinite scroll
app.get("/deviceSelectModel/:page", (req, res) => {
    //get all the required data
    const PAGE_ELEMENTS = 60;
    let keys = Object.keys(deviceLatencies);
    let page = req.params.page;

    if (page === "all") {
        //if the page parameter is "all" return all the models
        res.send(keys);
    } else {
        //return the specified page
        let start = page * PAGE_ELEMENTS;
        let result = keys.slice(start, start + PAGE_ELEMENTS);

        //when the elements are finished append a "-1"
        if (start + PAGE_ELEMENTS >= keys.length) {
            result.push("-1");
        }

        res.send(result);
    }
});

//subpage to select the OS version
app.get('/deviceSelectVersion', (req, res) => {
    //load the html file
    fs.readFile(__dirname + '/pages/deviceSelectVersion.html', function (err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            //get the selected model from the url
            let keys = Object.keys(deviceLatencies[req.query.model]);
            //insert the OS version of the model in the page and then return the generated file
            let stringToInsert = "";
            keys.forEach(function (item) {
                stringToInsert += '<div class="col colCard d-flex align-items-center">\n' +
                    '        <div class="card noPhoto mx-auto" onclick="clicked(\'' + item + '\')">\n' +
                    '            <div class="card-body">\n' +
                    '                <h5 class="card-title">' + item + '</h5>\n' +
                    '            </div>\n' +
                    '        </div>\n' +
                    '    </div>';
            })
            let page = data.toString().replace("TO_REPLACE", stringToInsert);
            res.send(page);
        }
    });
});

//method to confirm the choice and store the related latency in the session
app.post('/setDevice', (req, res) => {
    req.session.isMeasured = false;
    if (req.body.isPC === "true") {
        req.session.deviceLatency = 0;
        res.sendStatus(200);
    } else {
        req.session.deviceLatency = deviceLatencies[req.body.model][req.body.version] / 2000;
        res.sendStatus(200);
    }
});

//the page to measure tha latency
app.get('/latencyMeasurement', (req, res) => {
    res.sendFile(__dirname + '/pages/latencyMeasurement.html');
});

//method to get the latency from the latency measurement page and store it in the session
app.post('/latencyMeasurement/setLatency', (req, res) => {
    req.session.deviceLatency = req.body.latency;
    req.session.isMeasured = true;
    res.sendStatus(200);
});

//the page that shows the link session informations
app.get('/link', (req, res) => {
    //get the latency from the session
    let deviceLatency = req.session.deviceLatency;
    if (deviceLatency === undefined) {
        //if not present redirect to the page to select the device
        res.redirect("/");
    } else {
        //if latency is present load the file, insert the latency and return that
        fs.readFile(__dirname + '/pages/link.html', function (err, data) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                let page = data.toString().replace("LATENCY_TO_REPLACE", deviceLatency);
                page = page.replace("IS_LATENCY_MEASURED_TO_REPLACE", req.session.isMeasured);
                console.log(deviceLatency);
                res.send(page);
            }
        });
    }
});

//method that will return the footer, so it will be the same in all the pages
app.get('/footer', (req, res) => {
    res.sendFile(__dirname + "/pages/footer.html");
});


//SETUP SOCKET.IO
const io = require('socket.io')(server);

//create Link instance
const AbletonLink = require("abletonlink-addon");
const link = new AbletonLink();

//by default latency compensation is enabled
let latencyCompensation = true;


//on connection the socket will send the params to the client
io.on('connection', (socket) => {
    socket.emit("init", {
        "numPeers": link.getNumPeers(),
        "tempo": link.getTempo(true),
        "startStopSyncEnabled": link.isStartStopSyncEnabled(),
        "beat": link.getBeat(),
        "phase": link.getPhase()
    });

    if (latencyCompensation === true)
        socket.emit("enableLatencyCompensation");
    else
        socket.emit("disableLatencyCompensation");
    socket.emit("handshakeOK");

    socket.on("disableLatencyCompensation", () => {
        latencyCompensation = false;
        io.emit("disableLatencyCompensation");
    });
    socket.on("enableLatencyCompensation", () => {
        latencyCompensation = true;
        io.emit("enableLatencyCompensation");
    });
    socket.on("print", (msg) => {
        console.log(msg);
    })
    socket.on('disconnect', () => {
    });
});


//the callbacks, when the number of peers, the tempo or the start/stop state will chenge, the socket will send them to the client
link.setNumPeersCallback((numPeers) => io.emit('numPeers', numPeers));
link.setTempoCallback((tempo) => io.emit('tempo', link.getTempo(true)));
link.setStartStopCallback((startStopState) => io.emit('playState', startStopState));


//every 6ms the server will send the beat and phase to the clients
setInterval(() => {
    io.emit("beatPhase", {
        "beat": link.getBeat(),
        "phase": link.getPhase()
    });
}, 5);


//start listening
server.listen(3000, () => {
    console.log('listening on port 3000');
});
