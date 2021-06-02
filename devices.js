const SLEEP = require('./sleep');

var available;
function connectMQTT(client, subscribe = 0, message = {}, topic = '') {
    const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

    client.on('error', (err) => {
        console.log('Connection error: ', err)
        client.end()
    })

    client.on('reconnect', () => {
        console.log('Reconnecting...')
        
    })

    if (subscribe != 0 && message != {} && topic != '') {
        console.log('Client connected:' + clientId)
        // Publish
            client.publish(topic, JSON.stringify(message))
            SLEEP(1000);
            console.log('available: ' + available);
            if(available == 0){
                return false;
            }
            else {
                return true;
            }

        }

}



exports.connectMQTT = connectMQTT;
exports.available = available;
