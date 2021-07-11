// for mqtt connections
const { connectMQTT, checkAvailable } = require('./devices')
const { changeStatus, findSession } = require('../../model/user')
const { CONSOLE } = require('../../debug/debug')

// io sockets

function ioConnection (clientMQTT, io){
    io.set('authorization', function(handshake, callback){
        if(handshake.url.split('=')[1].startsWith('s%')){
            findSession(handshake.url.split('=')[1].split('%3A')[1].split('.')[0],(session)=>{
                if(!session){
                    return callback('No session.', false)
                }
                if(session.session.split('"user":')[1].split("}}")[0]){
                    handshake.sessionID = session._id;
                    return callback(null, true)
    
                }
            })
        }
        else {
            return callback('No session.', false)
        }
      });
    io.on('connection', socket => {
        CONSOLE('authenticated, giving a socket to the user!')
            // is a local variable flag responsible for being sure main node is connected or not
            socket.available = 0;
            CONSOLE('connected socket to server ' + socket.id);
            CONSOLE(socket.request.sessionID);
            
            // socket.on('data', (data)=> {
            //     socket.sid = data
            //     CONSOLE(socket.sid);
            // })
         
            // request available devices
            socket.on('requestAvailable', async (data)=> {
                await connectMQTT(clientMQTT, 1, data, 'unic').then(()=>{
                    CONSOLE('available: ' + socket.available);
                    if(socket.available == 0){
                        socket.emit('requestAvailable', {'response': '1'})
                    }
                    else {
                        socket.available = 0;
                    }
                })
            });
        
        
            // changes listening
            socket.on('changs', async data => {
                CONSOLE(`emitting: ${JSON.stringify(data.Status)}`)
                try {
                    await connectMQTT(clientMQTT, data.Status, 'unic').then(()=>{
                        if(checkAvailable(socket) == true){
                            changeStatus(data)
                            socket.emit('requestAvailable', {'response': '0'})
                            return;
                        }
                        else {
                            return;
                        }
                    })
                    
                } catch (e) {
                    CONSOLE(e);
                }
            });
            
            clientMQTT.on('message', function (topic, message) {
                CONSOLE(topic + ' topic, ' + message + ", Sent to client!");
                if(topic == 'dev'){
                    CONSOLE('setting available to 1...');
                    socket.available = 1;
                        if(message['nAv']){
                            socket.emit('requestAvailable', message)
                            return;
                        }
                        if(typeof message == 'String'){
                            socket.emit('deviceChange', message)
                        }
                        else {
                            socket.emit('deviceChange', JSON.parse(message))
                        }
                }
            });
    })
}

module.exports = {ioConnection}