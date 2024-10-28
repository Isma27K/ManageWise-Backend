const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/jwtAuth.js');
const { addApiKey } = require('../../functions/gemini/addApiKey.js');
const { deleteApiKey } = require('../../functions/gemini/deleteApiKey.js');

router.post('/addKeyword', authenticateToken, async (req, res) => {
    return addApiKey(req, res);
});

router.post('/deleteKeyword', authenticateToken, async (req, res) => {
    return deleteApiKey(req, res);
});

module.exports = router;
