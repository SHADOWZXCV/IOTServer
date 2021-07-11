const SLEEP = require('./sleep');
const { CONSOLE } = require('../../debug/debug')

module.exports = {
    connectMQTT: async (client, message = {}, topic = '') => {
        const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    
        client.on('error', (err) => {
            CONSOLE(`Connection error:${err}`)
            client.end()
        })
    
        client.on('reconnect', () => {
            CONSOLE('Reconnecting...')
            
        })
    
        if (message != {} && topic != '') {
            CONSOLE('Client connected:' + clientId)
            // Publish
                await client.publish(topic, JSON.stringify(message))
                await SLEEP(2000).then(()=>{
                    return;
                })
            }
    
    },
    checkAvailable: (socket) => {
    
        CONSOLE('available: ' + socket.available);
        // REMOVE!!!!!!
        // socket.available = 1;
        if(socket.available == 0){
            socket.emit('requestAvailable', {
                'response': '0'
            })
            return false;
        }
        else {
            socket.available = 0;
            return true;
        }
    }

}
