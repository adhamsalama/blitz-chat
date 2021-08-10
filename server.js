const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const views = require('./frontend/views')
const cookieParser = require('cookie-parser')
const http = require('http')
const socketio = require('socket.io')
const server = http.createServer(app)
const io = socketio(server)
const api = require('./api/api')(io)

mongoose.connect('mongodb://localhost:27017/chatter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(e => console.log('Server connected to the database'))

// app.use(session({
    // secret: '/&2N[@y3790),z(0.Fe[o41y~9$Zm4<Lz,N]3}8;z634jup5w8',
    // resave: true,
    // saveUninitialized: true,
    // store: MongoStore.create({mongoUrl: 'mongodb://localhost:27017/chatter'})
// }))

app.use(require('morgan')('short'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())
app.set('views', path.join(__dirname, 'frontend/views'))
app.set('view engine', 'ejs')
app.use('/api', api)
app.use('/', views)
app.use(express.static(require('path').join(__dirname, 'frontend/views/static')))
server.listen(3000, () => console.log('Running at port 3000'))