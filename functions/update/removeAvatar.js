const Mongob = require('../../utils/mongodb/mongodb.js');

const removeAvatar = async (req, res) => {
    const response = await Mongob('ManageWise', 'users', async (collection) => {
        const result = await collection.updateOne(
            { _id: req.user.uid },
            { $set: { avatar: "" } }
        );
        
        if (result.modifiedCount === 1) {
            return { status: 200, message: "Avatar removed successfully" };
        } else {
            return { status: 404, message: "User not found or avatar already removed" };
        }
    });

    return res.status(response.status).json({ message: response.message });
}

module.exports = { removeAvatar };
