const Mongob = require('../../utils/mongodb/mongodb.js');

const archivePool = async (req, res) => {
    try {
        const data = await Mongob('ManageWise', 'pools', async (collection) => {
            const pools = await collection.find({}).toArray();
            
            // Filter out archived tasks for each pool
            const filteredPools = pools.map(pool => ({
                ...pool,
                tasks: pool.tasks.filter(task => task.isArchived)
            }));
            
            return filteredPools;
        });

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { archivePool };
