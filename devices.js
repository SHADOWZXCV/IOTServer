const mqtt = require('mqtt');
exports.connectMQTT = connectMQTT;

const host = 'mqtt://test.mosquitto.org:1883'
exports.mqtt_s = host;

function connectMQTT(subscribe = 0, message = '', topic = '') {
    const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    console.log('Connecting mqtt client')
    const client = mqtt.connect(host)

    client.on('error', (err) => {
        console.log('Connection error: ', err)
        client.end()
    })

    client.on('reconnect', () => {
        console.log('Reconnecting...')
    })

    if (subscribe != 0 && message != '' && topic != '') {
        client.on('connect', () => {
            console.log('Client connected:' + clientId)
            // Publish
                client.publish(topic, message)
        })
    }
}

