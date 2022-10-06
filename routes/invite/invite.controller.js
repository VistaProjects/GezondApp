const express = require('express');
const router = express.Router();

const inviteService = require('./invite.service');

router.post('/create', (req, res) => inviteService.createInvite(req, res));

module.exports = router;