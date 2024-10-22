const Mongob = require('../../utils/mongodb/mongodb.js');
const { ObjectId } = require('mongodb');

const updatePool = async (req, res) => {
    const { poolId, name, description, userIds } = req.body;
    const user = req.user.uid;
    
    if (!req.user.admin) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!poolId || !name) {
        return res.status(400).json({ message: 'Pool ID and name are required' });
    }

    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            const updateResult = await collection.updateOne(
                { _id: poolId },
                {
                    $set: {
                        name: name,
                        description: description || '',
                        userIds: userIds || []
                    }
                }
            );

            if (updateResult.matchedCount === 0) {
                return { status: 404, message: 'Pool not found' };
            }

            if (updateResult.modifiedCount === 0) {
                return { status: 304, message: 'No changes made to the pool' };
            }

            return { status: 200, message: 'Pool updated successfully' };
        });

        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error('Error updating pool:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { updatePool };
