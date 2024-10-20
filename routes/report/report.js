const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../utils/auth/auth.js');
const { reportTask } = require('../../functions/report/report-main.js');


router.post('/report', authenticateToken, async (req, res) => {
    return reportTask(req, res);
});





module.exports = router;
