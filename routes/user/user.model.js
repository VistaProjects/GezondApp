const mongoose = require('mongoose')

// Groups
// 0 - Regular
// 1 - Moderator
// 2 - Administrator
// 3 - Banned

const userModel = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    gewicht: { type: Number, required: true, default: 0 },
    leeftijd: { type: Number, required: true, default: 0 },
    lengte: { type: Number, required: true, default: 0 },
}, { versionKey: false })

module.exports = mongoose.model('users', userModel)