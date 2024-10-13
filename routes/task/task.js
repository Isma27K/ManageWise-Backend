//====================== Imports ======================
const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const multer = require('multer');
const path = require('path');

//====================== Functions ======================
const { createTask } = require('../../functions/task/createTask.js');
const { updateProgress } = require('../../functions/task/updateProgress.js');
const { updateSelfTask } = require('../../functions/task/updateSelfTask.js');
const { createSelfTask } = require('../../functions/task/createSelfTask.js');

//====================== Multer Configuration ======================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', '..', 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

//====================== Routes ======================

router.post('/createTask', authenticateToken, upload.array('files'), async (req, res) => { // pool
    return createTask(req, res);
});

router.post('/updateProgress', authenticateToken, upload.single('attachment'), async (req, res) => { // pool
    return updateProgress(req, res);
});

router.post('/updateTaskProgress', authenticateToken,  upload.single('attachment'), async (req, res) => { // self
    return updateSelfTask(req, res); 
});
 
router.post('/createSelfTask', authenticateToken, upload.array('files'), async (req, res) => { //self
    return createSelfTask(req, res);
});

module.exports = router;
