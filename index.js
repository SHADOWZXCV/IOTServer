// This code is written by the backend developer Ezz-Aldin Husen, under no license certification yet.
// Uses http and the famous socket io for real-time user-to-server transmittion.
// And mqtt for fast, easy IoT-to-server data transmittion.
// Current database cluster is free atm, holds up to 500 connections, available at: https://cloud.mongodb.com/v2/5ffb1ceb9467e10b4446522f#clusters/edit/ClusterIOT.

// required made-modules
const MQTT_C = require('./devices');

// required modules
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {
    MongoClient
} = require('mongodb');
const mqtt = require('mqtt');

///////////////////////
var messageMQTT;
const clientMQTT = mqtt.connect('mqtt://test.mosquitto.org:1883');

clientMQTT.subscribe('sus', function (err) {
    if (err) console.log(err);
})
clientMQTT.on('message', function (topic, message) {
    console.log(topic + ' s ' + message + ", Sent to client!");
});
///////////////////
// setup server
var port = process.env.PORT || 3000;
server.listen(port, () => console.log(`app started at port 3000!`));

// mongodb connect
let clientMongo;
async function connectToDB(URi) {
    try {
        clientMongo = MongoClient(URi, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        if (!clientMongo.isConnected()) {
            await clientMongo.connect().then(function (data) {
                console.log("Connected to MongoDB cluster M0!!");
            });
        } else {
            console.log('connected to DB already');
        }

    } catch (e) {
        console.log(e);
    }
    //  finally {
    //      client.close();
    //  }
}


const URi = "mongodb+srv://Alexbnm:123qweasdzxc@clusteriot.eroin.mongodb.net/IOT?retryWrites=true&w=majority";
Object.freeze(URi);
connectToDB(URi);
// io sockets

io.on('connection', socket => {
    console.log('connected socket to server ' + socket.id);
    // changes listening
    socket.on('changs', data => {
        console.log('emitting: ' + data.Status);
        messageMQTT = data.Status;
        try {
            MQTT_C.findDevice(clientMongo, data).then(function (res) {
                if (res) {
                    // note: 1 is for publishing!
                    MQTT_C.connectMQTT(clientMQTT, 1, data.Status, 'sus');
                    socket.emit('changs', {
                        Result: messageMQTT
                    });
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
});