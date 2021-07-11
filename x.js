// This code is written by the backend developer Ezz-Aldin Husen, under no license certification yet.
// Uses http and the famous socket io for real-time user-to-server transmittion.
// And mqtt for fast, easy & lightweight IoT-to-server & vice versa data transmittion.
// Current database cluster is free atm, holds up to 500 connections, available at: https://cloud.mongodb.com/v2/5ffb1ceb9467e10b4446522f#clusters/edit/ClusterIOT.

/*
    LEFT TO DO:
    1. Test signup route. **WORKS!**
    2. add signin route & test it. **WORKS!**
    3. give client the ablility to have cookies & save them on
        flutter_secure_storage so they can be validated each requests, otherwise use JWT instead of sessions with flutter_secure_storage. **WORKS!!**
    4. Make sessionID the same as socketIO's ID, save it and verify it. 

devices document structure:
{
    _id:60c893daa7041eb2847fceab
    category:kitchen34tryr6
    id_main:1234567890
    nodes: [987654201,LED123456,lights of kitchen #1,0]
    for accessing the data inside nodes / (index + 1) % 4 == 0
    order:1
}
    */


const dotenv = require('dotenv')
dotenv.config()

// required made-modules

// required modules
// configs from env file
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('authenticated, giving a socket to the user!')
        // // is a local variable flag responsible for being sure main node is connected or not
        // socket.available = 0;
        // console.log('connected socket to server ' + socket.id);
     
     
        // // request available devices
        // socket.on('requestAvailable', async (data)=> {
        //     await connectMQTT(clientMQTT, 1, data, 'unic').then(()=>{
        //         console.log('available: ' + socket.available);
        //         if(socket.available == 0){
        //             socket.emit('requestAvailable', {'response': '0'})
        //         }
        //         else {
        //             socket.available = 0;
        //         }
        //     })
        // });
    
    
        // // changes listening
        // socket.on('changs', async data => {
        //     console.log('emitting: ' + JSON.stringify(data.Status));
        //     try {
        //         await connectMQTT(clientMQTT, data.Status, 'unic').then(()=>{
        //             if(checkAvailable(socket) == true){
        //                 changeStatus(data)
        //                 return;
        //             }
        //             else {
        //                 return;
        //             }
        //         })
                
        //     } catch (e) {
        //         console.log(e);
        //     }
        // });
        
        // clientMQTT.on('message', function (topic, message) {
        //     console.log(topic + ' topic, ' + message + ", Sent to client!");
        //     if(topic == 'dev'){
        //         console.log('setting available to 1...');
        //         socket.available = 1;
        //             if(message['nAv']){
        //                 socket.emit('requestAvailable', message)
        //                 return;
        //             }
        //             if(typeof message == 'String'){
        //                 socket.emit('deviceChange', message)
        //             }
        //             else {
        //                 socket.emit('deviceChange', JSON.parse(message))
        //             }
        //     }
        // });
})
server.listen((process.env.MODE === 'DEVELOPMENT') ? process.env.DEV_PORT : process.env.PROD_PORT, () => console.log(`app started at port 3000!`))