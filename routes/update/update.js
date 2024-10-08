const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');
const multer = require('multer');

// Set up multer for parsing multipart form data
const upload = multer();

// Middleware to parse JSON for all routes in this file
router.use(express.json({ limit: '10mb' })); // Increase limit to handle large base64 strings

router.post('/username', authenticateToken, async (req, res) => {
    const { newUsername } = req.body;
    const uid = req.user.uid;

    if (!newUsername) {
        return res.status(400).json({ error: "New username is required." });
    }

    try {
        const capitalizedUsername = newUsername.toUpperCase();
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.updateOne(
                { _id: uid },
                { $set: { name: capitalizedUsername } },
                { upsert: false }
            );
        });

        res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    const uid = req.user.uid;
    let avatar, name;

    // Check if the request is multipart form data or JSON
    if (req.file) {
        // Handle multipart form data
        avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        name = req.body.name;
    } else {
        // Handle JSON data
        ({ avatar, name } = req.body);
    }

    try {
        let updates = {};

        if (avatar) {
            // Ensure it's a valid base64 string
            if (!avatar.match(/^data:image\/(png|jpeg|jpg|gif);base64,/)) {
                return res.status(400).json({ error: "Invalid avatar format. Must be a base64 encoded image." });
            }
            updates.avatar = avatar;
        }

        if (name) {
            updates.name = name.toUpperCase(); // Capitalize the name
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No updates provided." });
        }

        // Update the user data in MongoDB
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.updateOne(
                { _id: uid },
                { $set: updates },
                { upsert: false }
            );
        });

        res.status(200).json({ message: 'Profile updated successfully', updates: Object.keys(updates) });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
