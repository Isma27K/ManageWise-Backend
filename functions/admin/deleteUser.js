const Mongob = require('../../utils/mongodb/mongodb.js');
const { authAdmin } = require('../../utils/firebase/firebaseAdmin.js');

const adminDeleteUser = async (req, res) => {
    const { userId } = req.body;

    if (!req.user.admin) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    try {
        const user = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne({_id: req.user.uid});
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.admin) {
            return res.status(401).json({ error: 'You are not authorized to do so' });
        }

        // Delete user from Firebase
        await authAdmin.deleteUser(userId);

        // Delete user from MongoDB
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.deleteOne({_id: userId});
        });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { adminDeleteUser };
