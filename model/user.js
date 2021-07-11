/* this module is doing 4 things:
1. puts new users
2. gets users
3. finds users by ids
4. changes status of a particular main node or its sub-nodes
*/
const { CONSOLE } = require('../debug/debug')

const mongoose = require('mongoose')

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'db connection error:'))
db.once('open', function() {
    CONSOLE('connected')
})

const userSchema = new mongoose.Schema({
    ID: String,
    Status: Object,
    email: String,
    nodeIDs: Array,
    password: String,
    sugar: String,
    username: String
}, {
    strict: false
})

const users = mongoose.model('users',userSchema, 'users')

const sessionSchema = new mongoose.Schema({
    _id: String,
    expires: Date,
    session: String
})

const sessions = mongoose.model('sessions' ,sessionSchema, 'sessions')

module.exports = {

    'users': users,

    insert: (data,callback)=> {
        users.findOne(
            { "email": data.user.email } , (err,foundUser)=> {
            if(err) throw err
            else if(foundUser) callback(1)
            else {
                CONSOLE('no user like that')
                const newUser = new users({...data.user})
                newUser.save((err,newUser)=> {
                    if(err) throw err
                    CONSOLE(JSON.stringify(newUser))
                    CONSOLE("new user has joined!")
                        callback(200)
                })
            }
        })

    },
    getUser: (data,callback)=> {
        users.findOne({ "email": data.email }, (err,foundUser)=> {
            if(err) throw err
            if(foundUser){
                CONSOLE(`user with email: ${data.email} exist on server!`)
                callback(200,foundUser)
            } 
            else {
                CONSOLE("Email doesn't exist on the server!")
                callback(1)
            }
        })
    },
    findById: (id,callback)=> {
        CONSOLE(id)
        users.findById(id, (err,foundUser)=> {
            if(err) throw err
            if(foundUser){
                CONSOLE('serialize found user')
                callback(200,foundUser)
            } 
            else {
                CONSOLE("User does not exist!")
                callback(1)
            }
        })
    },
    // for the first account setup, after the user finishes the setup.
    removeKey: (id,key,callback)=> {
        users.findById(id, (err,foundUser)=> {
            if(err) throw err
            if(foundUser){
                CONSOLE('found user, time to remove')
                users.findByIdAndUpdate(id, {$unset: {'first': 1}}).then((res)=> {
                    CONSOLE(res)
                    callback(200)
                })
            } 
            else {
                CONSOLE("Email doesn't exist on the server!")
                callback(1)
            }
        })
    },

    changeStatus: (data)=>{
        users.findById(data.DeviceID, function (err, res) {
            if (!res) {
                CONSOLE('Nothing');

            } else if (err) {
                CONSOLE(err);
            } else {
                CONSOLE('found it');
                // collection 'devices''s stuff, need to do it.
                // look for the corresponding ids on the devices' db
                var mainID;
                res.nodeIDs.map((id)=>{
                   if(id == data.Status.id_main){
                    mainID = id;
                   }
                })
                if(mainID != null){
                    // const devices = client.db('IOT').collection('Devices');
                    // devices.findOne({
                        
                    // })
                }

                users.updateOne({
                    "ID": data.DeviceID
                }, {
                    $set: {
                        "Status": data.Status
                    }
                }).then(async (res) => {
                    if (res) {
                        return 0;
                    }
                });

            }
        });
        return 0;
    },
    findSession: (sid,callback) =>  {
    
        sessions.findOne({
            "_id": sid
        },(err,session)=> {
          if(err){
              CONSOLE(err)
              return;
          }
          if(session){
            callback(session)
            return;
          }
        })
    }
    
}
