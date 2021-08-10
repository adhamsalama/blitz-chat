let mongoose = require('mongoose')
let userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    bio: String
})

userSchema.methods.name = function() {
    return this.username || this.username
}

let bcrypt = require("bcryptjs");
let SALT_FACTOR = 10;

let noop = function() {}

userSchema.pre('save', async function(done) {
    if(!this.isModified('password')) return done()
    this.password = await bcrypt.hash(this.password, SALT_FACTOR)
})

userSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch)
    })
}

let User = mongoose.model('User', userSchema)

module.exports = User