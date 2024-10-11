const { v4: uuidv4 } = require('uuid');
const Mongob = require('../../utils/mongodb/mongodb.js');

const adminGenerate = async (req, res) => {
    if (req.user.admin) {
        try {
            const user = await Mongob('ManageWise', 'users', async (collection) => {
                return await collection.findOne({_id: req.user.uid});
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (user.admin) {
                const id = uuidv4(); // Generate a unique ID

                // Insert the new document with both _id and time fields
                await Mongob('ManageWise', 'regId', async (collection) => {
                    return await collection.insertOne({
                        _id: id,
                        time: new Date(),
                    });     
                });

                res.status(200).json({ id }); // Return the generated ID
            } else {
                res.status(403).json({ error: 'User is not an admin' });
            }
        } catch (error) {
            console.error('Error in /generate route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized access' }); // Forbidden access for non-admins
    }
}

module.exports = { adminGenerate };