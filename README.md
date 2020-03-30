# AbletonLinkOnNodeServer
A Node server that uses the Ableton Link protocol. It serves a page to see the data of the Ableton Link session that is running on the same WiFi


## Tested Env
I only tested this on Ubuntu 18.04 running on WSL on Windows 10 and Node.js 6.0.0

**Important:** May not work with newer verion of Node.js due to nbind! So before the setup do
 ```
nvm install 6
```


## Dependencies
* [node-abletonlink](https://github.com/2bbb/node-abletonlink)
    * [Ableton Link](https://github.com/ableton/link)
    * [nbind](https://github.com/charto/nbind)
* [Express](https://expressjs.com)
* [Socket.IO](https://socket.io)


## Setup
Clone the repo
```
git clone https://github.com/Onni97/AbletonLinkOnNodeServer
```

Enter the directory and install the dependencies
```
cd AbletonLinkOnNodeServer
npm install
```

Start the server
```
npm start
```

Open the link on the browser of a PC on the save LAN to see the session data
```
http://*ServerLocalIP*:3000/
```
