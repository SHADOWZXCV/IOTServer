const SLEEP = require('./sleep');


async function connectMQTT(client, subscribe = 0, message = {}, topic = '', available) {
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
            await client.publish(topic, JSON.stringify(message))
            await SLEEP(10000);
            if(available == 0){
                return false;
            }
            else {
                return true;
            }

        }

}

exports.connectMQTT = connectMQTT;
