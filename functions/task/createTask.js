const Mongob = require('../../utils/mongodb/mongodb.js');
const path = require('path');

const createTask = async (req, res) => {
    try {
        const { name, description, dueDate, poolId, submitters } = req.body;

        if (!name || !description || !dueDate || !poolId || !submitters) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Handle file attachments
        const attachments = req.files ? req.files.map(file => ({
            name: file.originalname,
            link: path.join('uploads', file.filename)
        })) : [];

        // Parse dueDate and submitters
        const parsedDueDate = JSON.parse(dueDate);
        const parsedSubmitters = JSON.parse(submitters);

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
                dueDate: parsedDueDate,
                progress: [],
                contributor: parsedSubmitters,
                attachments: attachments,
                isArchived: false,
                createdAt: new Date(),
                archivedAt: null
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
}

module.exports = { createTask };
