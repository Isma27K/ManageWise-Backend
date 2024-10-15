const Mongob = require('../../utils/mongodb/mongodb.js');


const updateUsername = async (req, res) => {
    const { newUsername } = req.body;
    const uid = req.user.uid;

    if (!newUsername) {
        return res.status(400).json({ error: "New username is required." });
    }

    try {
        const capitalizedUsername = newUsername.toUpperCase();
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.updateOne(
                { _id: uid },
                { $set: { name: capitalizedUsername } },
                { upsert: false }
            );
        });

        res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {updateUsername}
