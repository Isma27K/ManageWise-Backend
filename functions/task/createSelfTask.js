const Mongob = require('../../utils/mongodb/mongodb.js');
const path = require('path');

const createSelfTask = async (req, res) => {
    try {
        const { name, description, dueDate, userId } = req.body;

        if (!name || !description || !dueDate || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Handle file attachments
        const attachments = req.files ? req.files.map(file => ({
            name: file.originalname,
            link: path.join('uploads', file.filename)
        })) : [];

        // Parse dueDate and submitters
        const parsedDueDate = JSON.parse(dueDate);

        // Use Mongob to perform the database operation
        const result = await Mongob('ManageWise', 'users', async (collection) => {
            // Find the pool by ID
            const pool = await collection.findOne({ _id: userId });

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
                attachments: attachments,
                isArchived: false
            };

            // Update the pool with the new task
            const updateResult = await collection.updateOne(
                { _id: userId },
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
};

module.exports = { createSelfTask };
