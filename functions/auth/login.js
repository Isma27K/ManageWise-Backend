const jwt = require('jsonwebtoken');
const {signInAuthWithEmailAndPassword} = require("../../utils/firebase/firebase.js");
const Mongob = require('../../utils/mongodb/mongodb.js');

const login = async (username, password) => {
    try {
        
        const result = await signInAuthWithEmailAndPassword(username, password);

        const user = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne({ _id: result.user.uid });
        });
        
        // Create JWT token with user information (e.g., uid)
        const token = jwt.sign(
            { 
                uid: result.user.uid,
                admin: user.admin // Add admin boolean, default to false
            },
            process.env.JWT_SECRET,
            { expiresIn: '7h' }
        );

        return { token };  // Send token back to the client
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = login;