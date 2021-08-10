const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../api/auth')

router.get('/', (req, res) => {
    res.render('signing')
})



router.use('/index', authenticateToken)
router.get('/index', (req, res) => {
    console.log('loggin user from views', req.user)
    res.send('logged in')

})

module.exports = router