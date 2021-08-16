const express = require('express')
const router = express.Router()
const Room = require('../models/room')
const User = require('../models/user')
const axios = require('axios').default

const { authenticateToken } = require('../api/auth')

router.get('/', (req, res) => {
    res.render('signing')
})


router.get('/index', authenticateToken, async (req, res) => {
    const rooms = await Room.find({type: 'public'})
    const userRooms = await Room.find({creator: req.user.username})
    res.render('index', {rooms: rooms, userRooms: userRooms})

})

router.get('/rooms/:room', authenticateToken, async (req, res) => {
    const room = await Room.findOne({name: req.params.room})
    res.render('room', {room: room})
})

router.get('/users/:user', authenticateToken, async (req, res) => {
    res.render('user')
})

module.exports = router