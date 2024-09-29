const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); 

const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');


router.post('/generate', authenticateToken, async (req, res) => {

    //console.log(req.user);

    // Check if the user is an admin
    if (req.user.admin) {
        try {
            const id = uuidv4(); // Generate a unique ID

            // Insert the new document with both _id and time fields
            await Mongob('ManageWise', 'regId', async (collection) => {
                return await collection.insertOne({
                    _id: id,
                    time: new Date(),
                });
            });

            res.status(200).json({ id }); // Return the generated ID
        } catch (error) {
            res.status(500).json({ error: error.message }); // Internal server error for database issues
        }
    } else {
        return res.status(403).json({ error: 'Unauthorized access' }); // Forbidden access for non-admins
    }
});

router.post('/CreatePool', authenticateToken, async (req, res) => {
    const { poolName, poolDescription, userId } = req.body;

    //console.log(poolName, poolDescription, userIds);

    if (req.user.admin) {
        // Check if userIds is an array if provided
        if (userId !== undefined && (!Array.isArray(userId) || userId.some(id => typeof id !== 'string'))) {
            return res.status(400).json({ error: 'userIds must be an array of strings' });
        }

        const poolId = uuidv4();

        await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.insertOne({
                _id: poolId,
                name: poolName,
                description: poolDescription,
                userIds: userId || [], // Use an empty array if userIds is not provided
                tasks: [],
                createdAt: new Date()
            }); 
        });

        res.status(200).json({ message: "OK", poolId: poolId });
    } else {
        return res.status(403).json({ error: 'Unauthorized access' }); // Forbidden access for non-admins
    }
});



module.exports = router;
