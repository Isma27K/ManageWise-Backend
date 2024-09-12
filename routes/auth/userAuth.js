const express = require('express');
const router = express.Router();
const login = require('../../functions/auth/login.js');
const register = require('../../functions/auth/register.js');
const Mongob = require("../../utils/mongodb/mongodb.js");


// Route for login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const loginResult = await login(username, password);
        res.status(200).json(loginResult);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Route for register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const registerResult = await register(name, email, password);
        
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.insertOne({ 
                _id: registerResult,
                name: name,
                email: email 
            });
        });

        res.status(200).json({message: "OK"});
    } catch (error) {  // Pass 'error' as a parameter here
        res.status(401).json({ error: error.message }); // Use 'error.message' to display the error message
    }
});

module.exports = router;
