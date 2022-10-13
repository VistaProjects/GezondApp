const express = require('express');
const router = express.Router();

const userService = require('./user.service');

router.post('/register', (req, res) => userService.registerUser(req, res));
router.post('/login', (req, res) => userService.loginUser(req, res));
router.post('/update', (req, res) => userService.updateUser(req, res));

module.exports = router;