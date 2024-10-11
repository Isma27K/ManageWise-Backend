const Mongob = require('../../utils/mongodb/mongodb.js');


const allUserData = async (req, res) => {
    try {
        const data = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.find({}, { projection: { _id: 1, name: 1, email: 1, avatar: 1 } }).toArray();
        });

        //console.log(data);
        
        const formattedData = data.map(user => ({
            uid: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }));
        
        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(401).json({ error: error.message });
    }
}

module.exports = { allUserData };
