const Mongob = require('../../utils/mongodb/mongodb.js');

const unarchiveTask = async (req, res) => {
    const { poolId, taskId } = req.body;

    try {
        const response = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.findOneAndUpdate(
                { _id: poolId, "tasks.id": taskId },
                { $set: { "tasks.$.isArchived": false } },
                { returnDocument: 'after' }
            );
        });

        res.status(200).json({ message: 'Task unarchived successfully', updatedPool: response.value });
    } catch (error) {
        console.error('Error in unarchiveTask:', error);
        res.status(500).json({ error: 'An error occurred while unarchiving the task' });
    }
};

module.exports = { unarchiveTask };
