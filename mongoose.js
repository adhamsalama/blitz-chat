const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/chatter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(e => console.log('Server connected to the database'))

const Room = require('./models/room')

Room.updateMany({type: 'private'}, {$set: {users: []}}).exec()