const Mongob = require('../../utils/mongodb/mongodb.js');

const deleteTask = async (req, res) => {
    const { poolId, taskId } = req.body;

    try {

        if (!poolId || !taskId) {
            return res.status(400).json({ error: 'Missing poolId or taskId' });
        }

        const response = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.findOneAndUpdate(
                { _id: poolId },
                { $pull: { tasks: { id: taskId } } },
                { returnDocument: 'after' }
            );
        });

        res.status(200).json({ message: 'Task deleted successfully', updatedPool: response.value });
    } catch (error) {
        console.error('Error in deleteTask:', error);
        res.status(500).json({ error: 'An error occurred while deleting the task' });
    }
}

module.exports = { deleteTask };