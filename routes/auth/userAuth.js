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
    const { id } = req.body;
    function hasNotPassedDays(dateString, days) {
        // Parse the input date string
        const givenDate = new Date(dateString);
        // Get the current date
        const currentDate = new Date();
    
        // Calculate the difference in time (in milliseconds)
        const timeDifference = currentDate - givenDate;
        // Convert milliseconds to days
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // 1000 ms * 60 s * 60 min * 24 hr
    
        // Return true if the difference is less than the specified days (i.e., not passed)
        return daysDifference < days;
    }

    try {
        const regId = await Mongob('ManageWise', 'regId', async (collection) => {
            return await collection.findOne({ _id: id });
        });

        if (!regId) {
            return res.status(404).json({ error: "Link not found" });
        }

        if (hasNotPassedDays(regId.time, 7)) {
            res.status(200).json({ message: "OK" });
        } else {
            res.status(401).json({ error: "Link expired" });
        }
    } catch (error) {
        console.error("Error checking link:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
