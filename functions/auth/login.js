const jwt = require('jsonwebtoken');
const {signInAuthWithEmailAndPassword} = require("../../utils/firebase/firebase.js");

const login = async (username, password) => {
    try {
        const result = await signInAuthWithEmailAndPassword(username, password);
        
        // Create JWT token with user information (e.g., uid)
        const token = jwt.sign(
            { uid: result.user.uid }, // Payload
            process.env.JWT_SECRET,   // Secret key
            { expiresIn: '1h' }       // Token expiry
        );

        return { token };  // Send token back to the client
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = login;