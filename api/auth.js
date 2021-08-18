// JWT Authentication
// https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
dotenv.config()

// The piece of data that you hash in your token can be something either a user ID or username or a much more complex object. In either case, it should be an identifier for a specific user.

function generateAccessToken(id) {
    return jwt.sign({ id: id }, '' + process.env.TOKEN_SECRET, { expiresIn: '24h' })
}

function authenticateToken(req, res, next) {
    const token = req.cookies['jwttoken']
    if (!token) return res.status(401).redirect('http://127.0.0.1:3000/accounts')

    jwt.verify(token, '' + process.env.TOKEN_SECRET, (err, user) => {

        //if (err) return res.sendStatus(403)
        if (err) return res.sendStatus(403)
        //console.log(user, user['id'])
        User.findById(user['id'], (err, user) => {
            req.user = user
            res.locals.currentUser = req.user
            next()
        })
    })
}

module.exports = {
    generateAccessToken,
    authenticateToken
}