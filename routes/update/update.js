const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');


router.post('/username', authenticateToken, async (req, res) => {
    const { newUsername } = req.body;
    const uid = req.user.uid; // Ensure req.user.uid exists from token validation middleware

    if (!newUsername) {
        return res.status(400).json({ error: "New username is required." });
    }

    try {

        // Update the email in MongoDB
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.updateOne(
                { _id: uid },
                { $set: { name: newUsername } },
                { upsert: false }
            );
        });

        res.status(200).json({ message: 'OK' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
