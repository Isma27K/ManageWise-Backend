const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); 

const authenticateToken = require("../../middleware/jwtAuth.js");
const Mongob = require('../../utils/mongodb/mongodb.js');
const { authAdmin } = require('../../utils/firebase/firebaseAdmin.js');
const { collection } = require('firebase/firestore');


router.post('/generate', authenticateToken, async (req, res) => {
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
});

router.post('/CreatePool', authenticateToken, async (req, res) => {
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
});


router.post('/DeleteUser', authenticateToken, async (req, res) => {
    const { userId } = req.body;

    if (req.user.admin) {
        try {

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
                await authAdmin.deleteUser(userId);

                await Mongob('ManageWise', 'users', async (collection) => {
                    return await collection.deleteOne({_id: userId});
                })

                res.status(200).json({ message: "User deleted successfully" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        console.log("")
    }

});
    



module.exports = router;
