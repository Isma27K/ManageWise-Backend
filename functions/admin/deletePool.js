const Mongob = require('../../utils/mongodb/mongodb.js');


const deletePool = async (req, res) => {
    const {poolId} = req.body;

    try {
        const pool = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.findOne({ _id: poolId });
        });

        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }

        if (pool.tasks && pool.tasks.length > 0) {
            return res.status(400).json({ error: 'Cannot delete pool with tasks' });
        }

        const response = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.deleteOne({ _id: poolId });
        });

        res.status(200).json({ message: 'Pool deleted successfully' });
    } catch (error) {
        console.error('Error in deletePool:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}


module.exports = { deletePool };
