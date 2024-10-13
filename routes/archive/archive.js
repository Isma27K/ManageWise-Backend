//============================= IMPORTS =============================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/jwtAuth.js');

//============================= FUNCTIONS =============================
const { archiveTask } = require('../../functions/archive/archiveTask.js');
//============================= ROUTES =============================
router.post('/archiveTask', authenticateToken, async (req, res) => {
    return archiveTask(req, res);
});


module.exports = router;

