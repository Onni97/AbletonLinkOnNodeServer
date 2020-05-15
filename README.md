# AbletonLinkOnNodeServer
### [Working on latency compensation for mobiles]

A Node server that uses the Ableton Link protocol, implemented using [abletonlink-node-addon](https://github.com/Onni97/abletonlink-node-addon).

It serves a page to see the data of the Ableton Link session that is running on the same WiFi.

The page will play a sound on the beat change, there is an audio latency compensation system made by me usings the Superpowered audio latency table.


## Tested Env
### OS tested: 
* Ubuntu 18.04 running on WSL on Windows 10
* Windows 10

### Node versions tested:
* 13.13.0
* 12.0.0
* 10.16.0
* All versions < 10.16.0 **doesn't** work


## Requisites
To run this project you need the **G++** compiler (4.8 or above), **Python** (v2.7, v3.5, v3.6, v3.7, or v3.8) and **Node** (10.16.0 or above)

### Linux
Run this command to install requisites:
```
sudo apt-get install g++ python
```

### Windows
You need the windows-buil-tools that containt boot G++ and Python, to install run:
```
npm install -g windows-buil-tools
```

## Dependencies
* [abletonlink-addon](https://github.com/Onni97/abletonlink-node-addon)
    * [Ableton Link](https://github.com/ableton/link)
* [express](https://expressjs.com)
* [socket.io](https://socket.io)


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

Open the link on the browser of a device on the same network to see the session data
```
http://*IP*:3000/
```

## License
MIT


## Author
Me, [Alessandro Oniarti](https://github.com/Onni97)

## Thanks
- [Superpowered](https://superpowered.com/) for the audio latency table