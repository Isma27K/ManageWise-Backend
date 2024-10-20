const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/jwtAuth.js');
const { reportMain } = require('../../functions/report/report-main.js');

router.post('/report', authenticateToken, async (req, res) => {
    return reportMain(req, res);
});

module.exports = router;
