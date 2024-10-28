const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/jwtAuth.js');
const { addApiKey } = require('../../functions/gemini/addApiKey.js');
const { deleteApiKey } = require('../../functions/gemini/deleteApiKey.js');
const { chat } = require('../../functions/gemini/chat.js');
const { getConversations, deleteConversation } = require('../../functions/gemini/conversations.js');

router.post('/addKeyword', authenticateToken, async (req, res) => {
    return addApiKey(req, res);
});

router.post('/deleteKeyword', authenticateToken, async (req, res) => {
    return deleteApiKey(req, res);
});

router.post('/chat', authenticateToken, async (req, res) => {
    return chat(req, res);
});

// New conversation management endpoints
router.get('/conversations', authenticateToken, async (req, res) => {
    return getConversations(req, res);
});

router.delete('/conversation', authenticateToken, async (req, res) => {
    return deleteConversation(req, res);
});

module.exports = router;
