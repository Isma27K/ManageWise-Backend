const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');
const multer = require('multer');
const { updateUsername } = require('../../functions/update/username.js');
const { updateAvatar } = require('../../functions/update/updateAvatar.js');
const { updatePool } = require('../../functions/update/updatePool.js');
const { removeAvatar } = require('../../functions/update/removeAvatar.js');

// Set up multer for parsing multipart form data with increased limits
const upload = multer({
    limits: {
        fieldSize: 10 * 1024 * 1024, // 10MB limit for fields
        fileSize: 10 * 1024 * 1024   // 10MB limit for files
    }
});

// Middleware to parse JSON for all routes in this file
router.use(express.json({ limit: '10mb' })); // Increase limit to handle large base64 strings

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
