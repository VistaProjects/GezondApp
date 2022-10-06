const mongoose = require('mongoose')

const inviteModel = mongoose.Schema({
    code: { type: String, required: true }
}, { versionKey: false })

module.exports = mongoose.model('invites', inviteModel)