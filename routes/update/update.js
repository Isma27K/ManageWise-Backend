const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');
const multer = require('multer');
const { updateUsername } = require('../../functions/update/username.js');
const { updateAvatar } = require('../../functions/update/updateAvatar.js');
const { updatePool } = require('../../functions/update/updatePool.js');
const { removeAvatar } = require('../../functions/update/removeAvatar.js');

// Set up multer for parsing multipart form data with 1MB limits
const upload = multer({
    limits: {
        fieldSize: 1 * 1024 * 1024, // 1MB limit for fields
        fileSize: 1 * 1024 * 1024   // 1MB limit for files
    }
});

// Middleware to parse JSON for all routes in this file
router.use(express.json({ limit: '1mb' })); // 1MB limit for JSON

router.post('/username', authenticateToken, async (req, res) => {
    return updateUsername(req, res);
});

router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    return updateAvatar(req, res);
});

router.post('/pool', authenticateToken, async (req, res) => {
    return updatePool(req, res);
});

router.post('/remove-avater', authenticateToken, async (req, res) => {
    return removeAvatar(req, res);
});

module.exports = router;
