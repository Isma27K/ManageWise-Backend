const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/jwtAuth.js');
const { addApiKey } = require('../../functions/gemini/addApiKey.js');

router.post('/addKeyword', authenticateToken, async (req, res) => {
    return addApiKey(req, res);
});

module.exports = router;
