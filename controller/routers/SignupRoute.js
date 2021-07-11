const { CONSOLE } = require('../../debug/debug')

const express = require('express')
const SignupAuth = express.Router()

// hand-made stuff
const { validateSchema, Schemas } = require('../middleware/validate')
const { insert } = require('../../model/user')

// needed stuff
const rand = require('csprng')
const argon2 = require('argon2')
const passport = require('passport')

// validate function 
const validate = (req,res,next)=> {
    
    CONSOLE('now on signupAuth, data is: ' + JSON.stringify(req.body) + '\n' )
    
    const result = validateSchema(req.body, Schemas.newUserSchema)
    
    // short figure-out-what
    if (result == 200) {
        CONSOLE('okay, data is validated!')
        next()
    }
    else {
        res.status(403).send({
            errors: result.map((error)=> {
                const errorP = {}
                errorP[error.path[0]] = error.type
                return errorP
            })
        })
    }
    
}

// hash the secure
const hash = (req,res,next)=> {
    const salt = rand(128,36)
    const hashedP = argon2.hash(req.body.password, {salt: Buffer.from(salt, "utf-8"), type: argon2.argon2id}).then((res)=> {
        const user = {
            "email": req.body["email"],
            "username": req.body["username"],
            "password": res,
            "sugar": salt
        }
        req.body.user = user
        CONSOLE(`HASHED USER`)
        CONSOLE(JSON.stringify(req.body.user))
        next()
    })
}

// insert data
const insertUser = (req,res,next)=> {
    insert({
        user: req.body.user
    },(result)=> {
        if(result == 200){
            next()
        }
        else if(result == 1){
            res.status(409).send({
                errors: [{
                    status: "User with this username or email already exist!"
                }]
            })   
        }
        else {
            CONSOLE("something went wrong")
        }
    })
}

SignupAuth.use('/' , validate, hash, insertUser, passport.authenticate('local'),
                (req,res,next)=>{
                    res.status(200).send("200")
})
module.exports = SignupAuth