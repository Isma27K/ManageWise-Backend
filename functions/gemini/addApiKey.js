const Mongob = require('../../utils/mongodb/mongodb.js');

const addApiKey = async (req, res) => {
    const { apiKey, uid } = req.body;

    try {
        const result = await Mongob('ManageWise', 'users', async (collection) => {
            const updateResult = await collection.updateOne(
                { _id: uid },
                { $set: { apiKey: apiKey, hasApi: true } }
            );

            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (updateResult.modifiedCount === 0) {
                return res.status(400).json({ message: 'No changes made' });
            }
        });

        return res.status(200).json({ message: 'API key added successfully' });
    } catch (error) {
        console.error('Error updating API key:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { addApiKey };
