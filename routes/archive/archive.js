//============================= IMPORTS =============================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/jwtAuth.js');

//============================= FUNCTIONS =============================
const { archiveTask } = require('../../functions/archive/archiveTask.js');
const { unarchiveTask } = require('../../functions/archive/unarchive.js');
const { deleteTask } = require('../../functions/archive/deleteTask.js')
//============================= ROUTES =============================
router.post('/archiveTask', authenticateToken, async (req, res) => {
    return archiveTask(req, res);
});

router.post('/unarchiveTask', authenticateToken, async (req, res) => {
    return unarchiveTask(req, res);
});

router.post('/deleteTask', authenticateToken, async (req, res) => {
    return deleteTask(req, res);
});




module.exports = router;

