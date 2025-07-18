const express = require('express');
const router = express.Router();
const { tokenCheck } = require('../middlewares/auth');
const Message = require('../models/messageModel');
const {
    getMessages
} = require('../controllers/chatController');

router.get('/messages/:userId', tokenCheck,getMessages);

module.exports = router;