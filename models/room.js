const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    creator: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    description: {type: String},
    messages: []
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room