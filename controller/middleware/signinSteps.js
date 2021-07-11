// hand-made stuff
const { validateSchema, Schemas } = require('./validate')
const { getUser } = require('../../model/user')
const { CONSOLE } = require('../../debug/debug')
// needed stuff
const argon2 = require('argon2')

module.exports = {
    // validate function 
    validateData : (req,res,next)=> {
    
        CONSOLE('now on signinAuth, data is: ' + JSON.stringify(req.body) + '\n' )
        
        const result = validateSchema(req.body, Schemas.signinUserSchema)
        CONSOLE('validated!1')
        CONSOLE(result)
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
    
},

// insert data
findUser: (email, callback)=> {
    CONSOLE('calling findUser')
    getUser({
        email: email
    },(result, data = {})=> {
        if(result == 200){
            CONSOLE('result on getUser is 200')
            callback(data)
        }
        else if(result == 1){
            CONSOLE('no email like that')
            callback(null)
        }
        else {
            CONSOLE("something went wrong")
        }
    })
},
        // hash the secure
        compare : (password, pData, callback)=>{
            CONSOLE(password)
            CONSOLE(pData.password)
            argon2.verify(pData.password, password, {salt: Buffer.from(pData.sugar, "utf-8"), type: argon2.argon2id}).then((result)=> {
                CONSOLE(`Does passwords match? ${result}`)
                if(result){
                    callback(200)
                    return;
                }
                else {
                    callback(1)
                    return;
                }
    
            })
    
        }
}