const express = require('express')
const api = express.Router()

const mongoose = require('mongoose')
const User = require('../models/user')
const Room = require('../models/room')
const UserRoom = require('../models/userRoom')
const { generateAccessToken, authenticateToken } = require('./auth')

const to = require('await-to-js').default



api.post('/signup', async (req, res) => {
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
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

api.use(authenticateToken)

api.get('/getCurrentUser', async (req, res) => {
    res.json({ username: req.user.username })
})

api.get('/user-rooms', async (req, res) => {
    res.json({ rooms: await Room.find({ creator: req.user.username }) })
})

api.get('/joined-rooms', async (req, res) => {
    let rooms = await Room.find({ users: req.user.username })
    console.log(rooms)
    res.json({ rooms: rooms })
})

api.get('/rooms/search', async (req, res) => {
    let q = req.query['q']
    const rooms = await Room.find({ name: { $regex: q, $options: 'i' }, type: 'public' }).select('name description -_id')
    res.json(rooms)
})

api.get('/rooms', async (req, res) => {
    res.json({ rooms: await Room.find({ type: 'public' }) })
})

api.post('/rooms', async (req, res) => {
    console.log(req.body)
    Room.create({
        name: req.body.name,
        type: req.body.type,
        creator: req.user.username,
        description: req.body.description,
        tags: req.body.tags
    }, (err, data) => {
        if (err) {
            if (err.code == 11000) { // duplicate
                console.log('duplicate')
                res.status(409).json('Room name already taken.')
                return
            }
        }
        else {
            res.sendStatus(201)
        }
    })
    //res.sendStatus(201)
})
api.get('/users/:username', async (req, res) => {
    const username = req.params.username
    const user = await User.findOne({ username: username }).select('username email -_id')
    res.json(user)
})

api.post('/admin-command', async (req, res) => {
    let [roomErr, room] = await to(Room.findOne({ name: req.body.room, creator: req.user.username }))
    if (roomErr)
        return res.sendStatus(401)
    if (!room)
        return res.status(403).json({ message: "Room doesn't exist" })
    let [userErr, user] = await to(User.findOne({ username: req.body.username }))
    if (userErr)
        return res.sendStatus(401)
    if (!user)
        return res.status(401).json({ message: "User doesn't exist" })
    if (req.body.command == 'add') {
        // User already in room's user list
        if (room.users.includes(user.username))
            return res.status(401).json({ message: 'User already added to room.' })
        room.users.push(user.username)
        room.save()
        return res.status(200).json({ message: 'User added successfully.' })
    }
    if (req.body.command == 'delete') {
        let userIndex = room.users.indexOf(user.username)
        // User not in room's user list
        if (userIndex < 0)
            return res.status(401).json({ message: 'User not in room.' })
        room.users.splice(userIndex, 1)
        room.save()
        return res.status(200).json({ message: 'User removed successfully.' })
    }

    res.sendStatus(403)
})

module.exports = (io) => {
    io.on('connection', async (socket) => {
        console.log('New Web Socket Connection');
        socket.on('joinRoom', async ({ username, room }) => {
            socket.join(room)

            // Welcome current user
            socket.emit('serverMessage', 'Welcome to Chatter')

            // Add user to user list
            if (!io.sockets.adapter.rooms.get(room).users) {
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
            socket.broadcast.to(room).emit('serverMessage', `${username} has joined the chat`)

            // Listen for a chat message
            socket.on('chatMessage', async (message) => {
                let thisRoom = await Room.findOne({ name: room })
                thisRoom.messages.push(message)
                thisRoom.save()
                io.to(room).emit('chatMessage', message)
            })

            socket.on('serverMessage', msg => io.to(room).emit('serverMessage', msg))

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

            // Recieve and emit a user is typing

            socket.on('userTyping', (username) => {
                socket.broadcast.to(room).emit('userTyping', username)
            })
        })
        socket.on('joinUser', async ({ firstUser, secondUser }) => {
            let userToUser = [firstUser, secondUser].sort().join('-')
            socket.broadcast.to(userToUser).emit('serverMessage', `${firstUser} has joined the chat`)
            socket.join(userToUser)
            // Find the document
            let thisRoom = await UserRoom.findOne({name: userToUser})
            if (!thisRoom)
                thisRoom = new UserRoom({
                    name: userToUser,
                    users: [firstUser, secondUser]
                })
            console.log(userToUser)
            socket.emit('getRoomMessages', thisRoom.messages)

            socket.on('userMessage', (message) => {
                io.to(userToUser).emit('userMessage', message)
                thisRoom.messages.push(message)
                thisRoom.save()
                console.log(thisRoom.messages)
            })
            socket.on('disconnect', () => {
                console.log('aaa')
                io.to(userToUser).emit('serverMessage', `${firstUser} has left the chat`)

            })
        })

    })
    return api
}