const { CONSOLE } = require('../../debug/debug')
const SigninAuth = require('express').Router()
const { validateData, alreadyAuthenticated } = require('../middleware/signinSteps')
const passport = require('passport')

SigninAuth.use('/',validateData , (req,res,next)=> {
    passport.authenticate('local',(err,user,info)=> {

        if(err){
            next(err)
        }
        if(info.status == 404){
            // no email like that
            res.send("404").end()
        }
        else if (info.status == 401){
            // password is wrong
            res.send("401").end()
        }
        else if (user && info.status == 200) {
            req.login(user, (err)=> {
                if(err) throw err
                CONSOLE(JSON.stringify(user))
                    res.status(200).send("200")
            })
        }
            
    })(req,res,next)
})
module.exports = SigninAuth