const express = require('express');
const router = express.Router();

const jwt = require('jwt-simple');

const uuid4 = require('uuid4')
const secrets = require('../secrets');
const bcrypt = require('bcryptjs'); //used to encrypt passwords

const db = require('../models');

const passport = require('passport');

router.use(passport.initialize())
require('../auth/passAuth')

router.use(express.urlencoded({ extended: false }))  //scrapes email and pwed from request header 
router.use(express.json())

//this is the gatekeeper 
let requireLogin = passport.authenticate('local', { session: false })
let requireJwt = passport.authenticate('jwt', { session: false })

const token = (userRecord) => {

    let timestamp = new Date().getTime();  //current time in ms
    // const payload = { sub: userRecord.id }
    // const token = jwt.sign(payload, secrets.secrets)

    console.log('jwt user record:', userRecord);
    //creates a jwt

    return jwt.encode({
        sub: userRecord.id,
        profilePic: userRecord.profilePic,
        name: userRecord.name,
        iat: timestamp
    }, secrets.secrets)
}


router.get('/', (req, res) => {
    res.send('hello world')
})


// registration api endpoint 

router.post('/registration', async (req, res) => {

    //collect data from the header of the request
    // email, password 

    try {

        let { name, email, password, profilePic } = req.body

        //check to see if this user is already in our db 

        let records = await db.users.findAll({ where: { email } })  /// [{}, {}, {}]

        if (records.length == 0) {
            // encrypt the password

            password = bcrypt.hashSync(password, 8)

            // create a new user record 

            let newUserRecord = await db.users.create({ name, email, password, profilePic })

            let jwtToken = token(newUserRecord)
            // create a jwt 
            // localStorage.setItem('token', jwtToken)
            // localStorage.setItem('userID', newUserRecord.id)
            // return jwt 
            console.log({ userID: req.user.id, token: jwtToken })
            res.json({
                userID: newUserRecord.id,
                profilePic: newUserRecord.profilePic,
                name: newUserRecord.name,
                token: jwtToken
            })
        }
        else {

            // user's email alreday exists in our db, so send back an error to react 

            res.status(422).json({ error: "Email already exists" })
        }



    }
    catch (error) {
        console.log(error, "error")
        res.status(432).json({ error: "Can't access database" })

    }


})


// login => user has no token => check credentials , email, pwd => token
// (passport local strategy)

router.post('/login', requireLogin, (req, res) => {
    console.log('creating token:', req.user.dataValues)
    let jwtToken = token(req.user.dataValues)
    res.json({
        userID: req.user.id,
        profilePic: req.user.profilePic,
        name: req.user.name,
        token: jwtToken
    })
    console.log({ userID: req.user.id, profilePic: req.user.profilePic, name: req.user.name, token: jwtToken })
})



// passport(jwt strategy)
// check our jwt token to see if it's still valid

router.get('/protected', requireJwt, (req, res) => {

    res.json({ isValid: true, id: req.user.id })
})

router.get('/wines/:userID', requireJwt, async (req, res) => {
    try {
        console.log('req.params', req.params)
        let { userID } = req.params
        let records = await db.favorites.findAll({ where: { userID } })
        console.log('wine list:', records)
        res.json({ favoriteList: records })
    } catch (error) {
        console.log('error displaying wine list: ', error)
        throw error
    }
})

router.post('/addwine', async (req, res) => {
    const { userID, notes, picture } = req.body
    try {
        const insertWine = await db.favorites.create({
            userID,
            notes,
            picture,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        res.sendStatus(200)
    } catch (error) {
        console.log('error adding wine: ', error)
        throw error
    }
})

router.delete('/favorites/:favoriteID', async (req, res) => {
    console.log('inside delete favorite', req.params)
    const { favoriteID } = req.params
    console.log('favorite id: ', favoriteID)
    // console.log('user id: ', userID)
    try {
        await db.favorites.destroy({ where: { id: favoriteID } })
        // const updatedFavorites = await db.favorites.findAll({ where: { userID: userID } })
        res.status(200)
        // let deleteFavorite = await db.favorites.destroy({ where: { id: favoriteID } })
        // res.sendStatus(200)
    } catch (error) {
        console.log('error deleting favorite', error)
        throw error
    }

})

// login api endpoint
module.exports = router;

