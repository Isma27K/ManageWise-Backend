const { v4: uuidv4 } = require('uuid');
const Mongob = require('../../utils/mongodb/mongodb.js');


const adminCreatePool = async (req, res) => {
    const { poolName, poolDescription, userId } = req.body;

    //console.log(poolName, poolDescription, userIds);

    if (req.user.admin) {

        try{
            const user = await Mongob('ManageWise', 'users', async (collection) => {
                return await collection.findOne({_id: req.user.uid});
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.admin){
                return res.status(401).json({error: 'you are not authorize to do so'})
            }

            if (user.admin) {
                
        
                // Check if userIds is an array if provided
                if (userId !== undefined && (!Array.isArray(userId) || userId.some(id => typeof id !== 'string'))) {
                    return res.status(400).json({ error: 'userIds must be an array of strings' });
                }

                const poolId = uuidv4();

                await Mongob('ManageWise', 'pools', async (collection) => {
                    return await collection.insertOne({
                        _id: poolId,
                        name: poolName,
                        description: poolDescription,
                        userIds: userId || [], // Use an empty array if userIds is not provided
                        tasks: [],
                        createdAt: new Date()
                    }); 
                });

                res.status(200).json({ message: "OK", poolId: poolId });
            }
        }
        catch(error){
            res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(403).json({ error: 'Unauthorized access' }); // Forbidden access for non-admins
    }
}

module.exports = { adminCreatePool };