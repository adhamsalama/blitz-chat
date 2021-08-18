const express = require('express')
const router = express.Router()
const Room = require('../models/room')
const User = require('../models/user')
const axios = require('axios').default

const { authenticateToken } = require('../api/auth')

router.get('/accounts', (req, res) => {
    res.render('signing')
})

router.use(authenticateToken)

router.get('/', async (req, res) => {
    const rooms = await Room.find({type: 'public'})
    const userRooms = await Room.find({creator: req.user.username})
    const joinedRooms = await Room.find({users: req.user.username})
    res.render('index', {rooms: rooms, userRooms: userRooms, joinRooms: joinedRooms})

})

router.get('/rooms/:room', async (req, res) => {
    const room = await Room.findOne({name: req.params.room})
    if(room.type == 'public' || room.creator == req.user.username || room.users.indexOf(req.user.username) >= 0)
        return res.render('room', {room: room})
    res.sendStatus(403)
})

router.get('/users/:user', async (req, res) => {
    res.render('user')
})

module.exports = router