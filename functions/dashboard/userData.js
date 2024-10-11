const Mongob = require('../../utils/mongodb/mongodb.js');


const userData = async (req, res) => {
    try {

        // Fetch user data from MongoDB
        const data = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne({ _id: req.user.uid });
        });

        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(401).json({ error: error.message });
    }
}

module.exports = { userData };

