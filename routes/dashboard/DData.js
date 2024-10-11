//====================== Imports ======================
const express = require('express');
const router = express.Router();
const authenticateToken = require("../../middleware/jwtAuth.js");

//====================== Functions ======================
const { userData } = require('../../functions/dashboard/userData.js');
const { dashboardData } = require('../../functions/dashboard/dashboardData.js');
const { allUserData } = require('../../functions/dashboard/allUserData.js');

//====================== Routes ======================

// Route for user Data
router.post('/DUdata', authenticateToken, async (req, res) => {
    return userData(req, res);
});

// Route for Dashboard Data
router.post('/DDdata', authenticateToken, async (req, res) => {
    return dashboardData(req, res);
});

// Route for All User Data
router.post('/AllUserData', authenticateToken, async (req, res) => {
    return allUserData(req, res);
});

module.exports = router;