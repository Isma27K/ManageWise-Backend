//====================== Imports ======================
const express = require('express');
const router = express.Router();

//====================== Functions ======================
const login = require('../../functions/auth/login.js');
const register = require('../../functions/auth/register.js');
const Mongob = require("../../utils/mongodb/mongodb.js");
const { checkLink } = require('../../functions/auth/checkLink.js');

//====================== Routes ======================
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
    const { name, email, password, id } = req.body;

    try {
        const registerResult = await register(name, email, password);
        
        await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.insertOne({ 
                _id: registerResult,
                name: name,
                email: email,
                admin: false 
            });
        });

        await Mongob('ManageWise', 'regId', async (collection) => {
            return await collection.deleteOne({ 
                _id: id 
            });
        });


        res.status(200).json({message: "OK"});
    } catch (error) {  // Pass 'error' as a parameter here
        res.status(401).json({ error: error.message }); // Use 'error.message' to display the error message
    }
});

router.post('/checkLink', async (req, res) => {
    return checkLink(req, res);
});

module.exports = router;
