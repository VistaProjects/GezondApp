const mongoose = require('mongoose')

const userModel = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    gewicht: { type: Number, required: true, default: 0 },
    leeftijd: { type: Number, required: true, default: 0 },
    lengte: { type: Number, required: true, default: 0 },
	eiwitten: { type: Array, required: true, default: [0,0,0,0,0,0,0] },
	suiker: { type: Array, required: true, default: [0,0,0,0,0,0,0] },
	koolhydraten: { type: Array, required: true, default: [0,0,0,0,0,0,0] },
	vet: { type: Array, required: true, default: [0,0,0,0,0,0,0] },
}, { versionKey: false })

module.exports = mongoose.model('users', userModel)