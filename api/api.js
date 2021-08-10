const express = require('express')
const api = express.Router()

const mongoose = require('mongoose')
const User = require('../models/user')

const { generateAccessToken } = require('./auth')

const to = require('await-to-js').default

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403)
        console.log('JWWWWWWWWWT', user)
        req.user = user

        next()
    })
}



//api.use('/login', authenticateToken)

api.post('/signup', async (req, res) => {
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    console.log(email, username, password);
    let [err, existingUser] = await to(User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    }))
    if (err) {
        res.status(401).json({ 'message': 'Something went wrong' })
        return
    }
    if (existingUser) {
        res.status(401).json({ 'message': 'Email and/or username already taken.' })
        return
    }
    let newUser = new User({
        email: email,
        username: username,
        password: password
    })
    await newUser.save()
    console.log(newUser)

    // const token = generateAccessToken(username)
    // console.log(token)
    // res.status(201).json(token)
    res.status(201).json({ 'message': 'Account created successfully.' })

})

api.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(403).json({ 'message': 'Something went wrong.' })
            return
        }
        if (!user) {
            console.log('no user')
            res.status(401).json({ 'message': 'Invalid credentials.' })
            return
        }
        console.log('this is the user', user)
        user.checkPassword(password, (err, isMatch) => {
            if (err) {
                console.log(err)
                res.sendStatus(406)
                return
            }
            if (!isMatch) {
                res.status(401).json({ 'message': 'Wrong password.' })
                return
            }
            console.log('login', user)
            // Generate token for user
            const token = generateAccessToken(user._id)
            console.log(token)
            res.json(token)
        })

    })

})
module.exports = api