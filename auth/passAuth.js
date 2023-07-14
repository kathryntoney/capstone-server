const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy

const ExtractJwt = require('passport-jwt').ExtractJwt

const db = require('../models')

const bcrypt = require('bcryptjs')

const secrets = require('../secrets')

let options = {
    usernameField: 'email'
}


let localStrategy = new LocalStrategy(options, async (email, password, done) => {
    console.log('checkpoint 1, login')
    try {
        console.log('checkpoint 2, login')
        // check if email in in our db
        let records = await db.users.findAll({ where: { email } })

        if (records !== null) {
            // if the email is found,

            // if the email foound, compare new password with encrypted password in db 
            console.log('checkpoint 3, login')
            // console.log(password)
            console.log(records)
            // console.log(records[0].password)
            bcrypt.compare(password, records[0].password, (err, isMatch) => {

                if (err) {
                    // there is an error
                    return done(err) // error found by bcrypt
                }

                if (!isMatch) {
                    return done(null, false) // no auth because passwords didn't match
                }
                console.log('checkpoint 4, login')
                return done(null, records[0]) //match was found, send record

                //req.user

            })
        }
        else {
            // no email was found 
            console.log('checkpoint 5')
            return done(null, false)
        }
    }
    catch (error) {

        // can't access database 
        console.log(error)
        return done(error)
    }





    // if there is a match, passback the record found when looking for password


    //if no email was found, then passback done(null, false)

    // catch done(error)
})

/**
 * JwtStrategy
 * 
 * * check to if our token is valid
 */


let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'), //
    secretOrKey: secrets.secrets

}

let jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    console.log('checkpoint 1 jwt strat')
    try {
        console.log(payload)
        let userID = payload.sub;
        console.log('userID: ', userID)
        let user = await db.users.findByPk(userID) // {}  or null
        console.log('checkpoint 2 jwt strat')
        if (user) {
            console.log('checkpoint 3 jwt strat')
            return done(null, user)  // place the user object on the req.user
            // req.user = {id, email, password, createAt, updatedAt}
        }
        else {

            // no use found
            console.log('checkpoint 4 jwt strat')
            return done(null, false) // not putting anythig on the req
        }

    }
    catch (error) {
        // error in decoding the token or reading the db
        console.log('checkpoint 5', error)
        return done(error)
    }

})


passport.use(localStrategy)
passport.use(jwtLogin)