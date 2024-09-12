const express = require('express');
const router = express.Router();
const test1 = require('../../functions/test1.js');
const authenticateToken = require('../../middleware/jwtAuth.js');

router.get('/test1', (req, res) => {
    const result = test1(); // Call the test1 function
    res.status(200).json(result); // Send the result as JSON
});

router.get('/protected-resource', authenticateToken, (req, res) => {
    // The user is authenticated and req.user contains user data
    res.json({ message: `Hello, user ${req.user.uid}` });
});


module.exports = router;
