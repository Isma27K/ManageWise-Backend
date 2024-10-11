//============================= IMPORTS =============================
const express = require('express');
const router = express.Router();

//============================= MIDDLEWARE =============================
const authenticateToken = require("../../middleware/jwtAuth.js");

//============================= FUNCTIONS =============================
const { adminGenerate } = require('../../functions/admin/generate.js');
const { adminCreatePool } = require('../../functions/admin/createPool.js');
const { adminDeleteUser } = require('../../functions/admin/deleteUser.js');

//============================= ROUTES =============================

router.post('/generate', authenticateToken, async (req, res) => {
    return adminGenerate(req, res);
});

router.post('/CreatePool', authenticateToken, async (req, res) => {
    return adminCreatePool(req, res);
});

router.post('/DeleteUser', authenticateToken, async (req, res) => {
    return adminDeleteUser(req, res);
});
    



module.exports = router;
