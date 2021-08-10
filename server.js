const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const api = require('./api/api')
const views = require('./frontend/views')
const cookieParser = require('cookie-parser')
mongoose.connect('mongodb://localhost:27017/chatter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(e => console.log('Server connected to the database'))


app.use(require('morgan')('short'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())
app.set('views', path.join(__dirname, 'frontend/views'))
app.set('view engine', 'ejs')
app.use('/api', api)
app.use('/', views)

app.listen(3000, () => console.log('Running at port 3000'))