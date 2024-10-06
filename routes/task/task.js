const Mongob = require("../../utils/mongodb/mongodb.js");
const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");

router.post('/createTask', authenticateToken, async (req, res) => {
    //console.log('Received request body:', req.body);  // Log the entire request body

    try {
        const { name, description, dueDate, poolId, submitters } = req.body;

        if (!name || !description || !dueDate || !poolId || !submitters) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Use Mongob to perform the database operation
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            // Find the pool by ID
            const pool = await collection.findOne({ _id: poolId });

            if (!pool) {
                return { error: 'Pool not found' };
            }

            // Create the new task
            const newTask = {
                id: pool.tasks ? pool.tasks.length + 1 : 1,
                name,
                description,
                dueDate,
                progress: [],
                contributor: submitters
            };

            // Update the pool with the new task
            const updateResult = await collection.updateOne(
                { _id: poolId },
                { $push: { tasks: newTask } }
            );

            if (updateResult.modifiedCount === 1) {
                return { message: 'Task created successfully', task: newTask };
            } else {
                return { error: 'Failed to create task' };
            }
        });

        if (result.error) {
            return res.status(result.error === 'Pool not found' ? 404 : 500).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in createTask:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;