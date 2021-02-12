// This code is written by the backend developer Ezz-Aldin Husen, under no license certification yet.
// Uses http and the famous socket io for real-time user-to-server transmittion.
// And mqtt for fast, easy IoT-to-server data transmittion.
// Current database cluster is free atm, holds up to 500 connections, available at: https://cloud.mongodb.com/v2/5ffb1ceb9467e10b4446522f#clusters/edit/ClusterIOT.
// required made-modules
// const MQTT_C = require('./devices');
// required modules
const express = require('express');
const app = express();
const http = require('http');
const socket = require('socket.io');
const mongoDB = require('mongodb');
// const mqtt = require('mqtt');
///////////////////////

// const client = mqtt.connect('mqtt://test.mosquitto.org:1883');

// client.subscribe('sus', function (err) {
//     if (err) console.log(err);
// })
// client.on('message', function (topic, message) {
//     console.log(topic + ' s ' + message)
// });
///////////////////

// setup server
const server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, () => console.log(`app started at port 3000!`));


// mongodb connect
const URL = "mongodb+srv://Alexbnm:123qweasdzxc@clusteriot.eroin.mongodb.net/IOT?retryWrites=true&w=majority";


// io sockets
const io = socket(server);


app.get('/', function (req, res, next) {
    io.on('connection', socket => {
        console.log('connected socket to server ' + socket.id);
        mongoDB.connect(URL, function (err, db) {
            if (err) throw err;
            const table = db.db("IOT");
            const devices = table.collection('Devices');

            // changes listening
            socket.on('changing', data => {
                console.log('emitted!');
                devices.findOne({
                    "ID": data.DeviceID
                }, function (err, res) {
                    if (!res) {
                        console.log('Nothing');
                        db.close();
                    } else if (err) {
                        console.log(err);
                    } else {
                        // note: 1 is for publishing!
                        // MQTT_C.connectMQTT(1, data.Status, 'sus');
                        devices.updateOne({
                            "ID": data.DeviceID
                        }, {
                            $set: {
                                "Status": data.Status
                            }
                        }).then(function (res) {
                            if (res) {
                                socket.emit('changing', {
                                    Result: 1
                                });
                            }
                        });

                    }

                });
            });
        });
    });


});





// devices setup 
//mongoDB.connect(url, function(err, db){
//    if(err) throw err;
//    const table = db.db('IOT');
//    var device = {
//        ID: "121200300312003g",
//        Status: 0
//    }
//    table.collection('Devices').insertOne(device,function(err, res){
//        if(err) throw err;
//        console.log('added device');
//    });
//});