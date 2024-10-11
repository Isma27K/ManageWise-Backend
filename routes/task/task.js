//====================== Imports ======================
const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");

//====================== Functions ======================
const { createTask } = require('../../functions/task/createTask.js');
const { updateProgress } = require('../../functions/task/updateProgress.js');

//====================== Routes ======================

router.post('/createTask', authenticateToken, async (req, res) => {
    return createTask(req, res);
});


router.post('/updateProgress', authenticateToken, async (req, res) => {
    return updateProgress(req, res);
});

module.exports = router;