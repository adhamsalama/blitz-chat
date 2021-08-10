const express = require('express')
const api = express.Router()

const mongoose = require('mongoose')
const User = require('../models/user')
const Room = require('../models/room')
const { generateAccessToken, authenticateToken } = require('./auth')

const to = require('await-to-js').default



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

api.get('/getCurrentUser', authenticateToken, async (req, res) => {
    console.log(req.user)
    res.json({ username: req.user.username })
})
module.exports = (io) => {
    io.on('connection', async (socket) => {
        io.sockets
        console.log('New Web Socket Connection');
        socket.on('joinRoom', async ({ username, room }) => {
            socket.join(room)
            
            // Welcome current user
            socket.emit('serverMessage', 'Welcome to Chatter')
            
            // Add user to user list
            if(!io.sockets.adapter.rooms.get(room).users) {
                io.sockets.adapter.rooms.get(room).users = []
            }
            io.sockets.adapter.rooms.get(room).users.push(username)

            // Send list of users
            io.to(room).emit('sendUsers', io.sockets.adapter.rooms.get(room).users)
            
            console.log(io.sockets.adapter.rooms.get(room).users)

            //io.sockets.adapter.rooms.get('room').users.push(username)
            const messages = (await Room.findOne({ name: room })).messages

            socket.emit('getRoomMessages', messages)
            // Broadcast when a user connects
            socket.broadcast.to(room).emit('serverMessage', `${username} user has joined the chat`)

            // Runs when a client disconnects
            socket.on('disconnect', () => {
                io.to(room).emit('serverMessage', `${username} has left the chat`)
                // Remove username from list of users and send the rest if room still open
                if (io.sockets.adapter.rooms.get(room)) {
                    io.sockets.adapter.rooms.get(room).users.splice(io.sockets.adapter.rooms.get(room).users.indexOf(username), 1)
                    io.to(room).emit('sendUsers', io.sockets.adapter.rooms.get(room).users)
                }
                    
                //console.log(io.sockets.adapter.rooms.get(room).users)
            })

            // Listen for a chat message
            socket.on('chatMessage', async (message) => {
                let thisRoom = await Room.findOne({ name: room })
                console.log(thisRoom)
                thisRoom.messages.push(message)
                await thisRoom.save()
                io.to(room).emit('chatMessage', message)
            })

            socket.on('serverMessage', msg => io.to(room).emit('serverMessage', msg))
        })


    })
    return api
}