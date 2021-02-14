const mqtt = require('mqtt');
exports.connectMQTT = connectMQTT;
exports.findDevice = findDeviceInDB;

function connectMQTT(client, subscribe = 0, message = '', topic = '') {
    const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

    client.on('error', (err) => {
        console.log('Connection error: ', err)
        client.end()
    })

    client.on('reconnect', () => {
        console.log('Reconnecting...')
    })

    if (subscribe != 0 && message != '' && topic != '') {
        console.log('Client connected:' + clientId)
        // Publish
        client.publish(topic, message)

    }
}

function findDeviceInDB(data, clientMongo) {
    const devices = clientMongo.db('IOT').collection('Devices');
    devices.findOne({
        "ID": data.DeviceID
    }, function (err, res) {
        if (!res) {
            console.log('Nothing');
            db.close().then((data) => console.log('db closed'));
        } else if (err) {
            console.log(err);
        } else {
            console.log('found it');
            devices.updateOne({
                "ID": data.DeviceID
            }, {
                $set: {
                    "Status": data.Status
                }
            })
        }
    });
}