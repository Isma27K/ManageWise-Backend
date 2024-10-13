const Mongob = require('../../utils/mongodb/mongodb.js');

const archiveTask = async (req, res) => {
    const { poolId, taskId } = req.body;

    try {
        const response = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.findOneAndUpdate(
                { _id: poolId, "tasks.id": parseInt(taskId) },
                { $set: { "tasks.$.isArchived": true } },
                { returnDocument: 'after' }
            );
        });


        if (!response || !response.tasks) {
            return res.status(404).json({ error: 'Pool or task not found' });
        }

        const updatedTask = response.tasks.find(task => task.id === parseInt(taskId));
        if (!updatedTask || !updatedTask.isArchived) {
            return res.status(500).json({ error: 'Failed to archive task' });
        }

        res.status(200).json({ message: 'Task archived successfully', updatedPool: response });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while archiving the task' });
    }
};

module.exports = { archiveTask };
