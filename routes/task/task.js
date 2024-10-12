//====================== Imports ======================
const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const multer = require('multer');
const path = require('path');

//====================== Functions ======================
const { createTask } = require('../../functions/task/createTask.js');
const { updateProgress } = require('../../functions/task/updateProgress.js');

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

router.post('/createTask', authenticateToken, upload.array('files'), async (req, res) => {
    return createTask(req, res);
});

router.post('/updateProgress', authenticateToken, upload.single('attachment'), async (req, res) => {
    return updateProgress(req, res);
});

module.exports = router;
