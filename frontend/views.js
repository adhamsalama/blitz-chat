const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Room = require('../models/room')

const { authenticateToken } = require('../api/auth')

router.get('/', (req, res) => {
    res.render('signing')
})


router.get('/index', authenticateToken, async (req, res) => {
    console.log('loggin user from views', req.user)
    const rooms = await Room.find()
    //console.log(rooms)
    rooms.forEach(function(room) {console.log(room)})
    res.render('index', {rooms: rooms})

})

router.get('/rooms/:room', authenticateToken, async (req, res) => {
    const room = await Room.findOne({name: req.params.room})
    res.render('room', {room: room})
})

//router.use(express.static(require('path').join(__dirname, 'static')))
module.exports = router