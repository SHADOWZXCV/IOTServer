// This code is written by the backend developer Ezz-Aldin Husen, under no license certification yet.
// Uses http and the famous socket.IO for real-time user-to-server transmittion.
// And mqtt for fast, easy & lightweight IoT-to-server & vice versa data transmittion.
// Current database cluster is free atm, holds up to 500 connections, available at: https://cloud.mongodb.com/v2/5ffb1ceb9467e10b4446522f#clusters/edit/ClusterIOT.

/*
    LEFT TO DO:
    1. Test signup route. **WORKS!**
    2. add signin route & test it. **WORKS!**
    3. give client the ablility to have cookies & save them on
        flutter_secure_storage so they can be valiDated each requests, otherwise use JWT instead of sessions with flutter_secure_storage. **WORKS!!**
    4. Make sessionID the same as socketIO's ID, save it and verify it. KINDA WORKS, NEEDS MORE WORK.

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

// debug
const { CONSOLE } = require('./debug/debug')

// configs from env file
const dotenv = require('dotenv')
dotenv.config()

// required made-modules
const { ioConnection } = require('./controller/board_communications/sIO')

// required modules
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mqtt = require('mqtt');

// required modules for authentication
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
const MongoStore = require('connect-mongo')

// EXPENSIVE AS HELL, NEED TO USE AFTER SUCCESSFULl START!

// const redisClient = require('redis').createClient()
// const redisStore = require('connect-redis')(session)
// redisClient.on('error', (err)=> {
//     CONSOLE("An error on redis cache: " + err)
// })
// const sStore = new redisStore({ host: 'redis-10852.c82.us-east-1-2.ec2.cloud.redislabs.com' , port: '10852', client: redisClient, pass: 'XkFVlE2Vy1EdeLLz0r787Gyv8pVyyT3j' })
// sStore.on('error', (err)=> {
//     CONSOLE("An error on redis cache: " + err)
// })


//middlewares
var corsOptions = { origin: '*', credentials: true }
const Session = session({
    genid: (req)=> {
        return uuidv4()
    },
    secret: process.env.SESSION_S,
    store: MongoStore.create({mongoUrl: process.env.DB_URI}),
    cookie: {
        secure: false,
        sameSite :true,
        httpOnly: false,
        maxAge: 1000 * 9999,
    },
    saveUninitialized: false,
    resave: true
})
app.use(cors(corsOptions))
app.use(Session)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// AUTHENTICATION strategy config
const passport = require('passport'),
localStrat = require('passport-local').Strategy
const { findUser, compare } = require('./controller/middleware/signinSteps')
const { findById } = require('./model/user')

passport.use(new localStrat({ 
    usernameField: 'email',
    passwordField: 'password'
}, (email,password,done)=> {

    findUser(email, (user)=> {
        if(!user){
            return done(null, false, { status: 404 })
        }
        CONSOLE('comparing passwords :')
        compare(password, user, (res2)=> {
            if(res2 == 1) {
                CONSOLE('nope, password is wrong')
                return done(null, false, { status: 401 })
            }
            if(res2 == 200){
                CONSOLE('password matches')
                return done(null, user, { status: 200 })
            }
        })
    })
}))
passport.serializeUser((user,done)=> {
    return done(null,user.id)
})
passport.deserializeUser((id,done)=> {
    findById(id,(result, user)=> {
        if(result == 200){
            if(user) {
                return done(null,{
                    id,
                    'name': user.username
                })
            }
            else{
                return done(null,false)
            }
        }
    })
})

app.use(passport.initialize())
app.use(passport.session())


// routers
const SigninAuth = require('./controller/routers/AuthRoute')
const SignupAuth = require('./controller/routers/SignupRoute')
// const SetupRoute = require('./controller/routers/SetupRoute')

// ROUTES declaration
app.post('/signin', SigninAuth)
app.post('/signup', SignupAuth)

app.get('/dashboard', (req,res,next)=>{
    if(req.isAuthenticated()){
        CONSOLE('hey dashboard')
        res.send({
            status: "200",
            name: req.user.name,
            id: req.user.id
        }).end()
    }
    else {
        CONSOLE( req.cookies['connect.sid'])
        CONSOLE( req.session.passport)
        CONSOLE('no dashboard')
        res.send({
            status: "401",
        }).end()

    }
})

app.get('/signout', (req,res,next)=>{
        CONSOLE('signed out')
        req.logOut()
        req.session.destroy()
        res.send("200").end()
})


// DEVICES TRANSMISSION INIT START

const clientMQTT = mqtt.connect(process.env.MQTT_URI).once('connect',()=> CONSOLE('connected to mqtt'))
ioConnection(clientMQTT,io)

// DEVICES TRANSMISSION INIT END

server.listen(process.env.MODE === 'DEVELOPMENT' ? process.env.DEV_PORT : process.env.PORT, () => CONSOLE(`Server started at port ${process.env.MODE === 'DEVELOPMENT' ? process.env.DEV_PORT : process.env.PORT}`))
