const Mongob = require("../../utils/mongodb/mongodb.js");
const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");

// Route for user Data
router.post('/DUdata', authenticateToken, async (req, res) => {
    try {

        // Fetch user data from MongoDB
        const data = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne({ _id: req.user.uid });
        });

        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(401).json({ error: error.message });
    }
});

// Route for Dashboard Data
router.post('/DDdata', authenticateToken, async (req, res) => {
    try {
        const data = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.find({}).toArray();
        });

        // Placeholder for dashboard data
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(401).json({ error: error.message });
    }
});

router.post('/AllUserData', authenticateToken, async (req, res) => {
    try {
        const data = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.find({}, { projection: { _id: 1, name: 1, email: 1, avatar: 1 } }).toArray();
        });

        //console.log(data);
        
        const formattedData = data.map(user => ({
            uid: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }));
        
        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;