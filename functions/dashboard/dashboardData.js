const Mongob = require('../../utils/mongodb/mongodb.js');

const dashboardData = async (req, res) => {
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
}

module.exports = { dashboardData };
