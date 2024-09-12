const { createUserWithEmailAndPasswordCustom } = require('../../utils/firebase/firebase.js');

const register = async (name, email, password) => {
    try {
        // Wait for the user to be created
        const userCredential = await createUserWithEmailAndPasswordCustom(email, password);
        // You may want to save the user's name or additional data here if needed
        //return { message: "OK" };
        return userCredential.user.uid;
    } catch (error) {
        throw new Error('Register failed: ' + error.message);
    }
};

module.exports = register;
