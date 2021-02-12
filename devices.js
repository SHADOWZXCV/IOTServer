const mqtt = require('mqtt');
exports.connectMQTT = connectMQTT;


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