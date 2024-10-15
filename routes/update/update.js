const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');
const multer = require('multer');
const { updateUsername } = require('../../functions/update/username.js');
const { updateAvatar } = require('../../functions/update/updateAvatar.js');

// Set up multer for parsing multipart form data
const upload = multer();

// Middleware to parse JSON for all routes in this file
router.use(express.json({ limit: '10mb' })); // Increase limit to handle large base64 strings

router.post('/username', authenticateToken, async (req, res) => {
    return updateUsername(req, res);
});

router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    return updateAvatar(req, res);
});

module.exports = router;
