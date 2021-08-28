const mongoose = require('mongoose')

const userRoomSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    createdAt: {type: Date, default: Date.now},
    description: {type: String},
    messages: {
        type: Array,
        default: []
    },
    users: {
        type: Array,
        default: []
    }
})

const UserRoom = mongoose.model('UserRoom', userRoomSchema)

module.exports = UserRoom