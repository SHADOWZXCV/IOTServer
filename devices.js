const SLEEP = require('./sleep');


async function connectMQTT(client, subscribe = 0, message = {}, topic = '') {
    const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    let isAv = 0;

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
            await SLEEP(2000).then(()=>{
                return;
            })
        }

}

function checkAvailable(available){
    if(available == 0){
        isAv = 0;
    }
    else {
        isAv = 1;
    }
    return isAv;
}
exports.connectMQTT = connectMQTT;
exports.checkAvailable = checkAvailable;
