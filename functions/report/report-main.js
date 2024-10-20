const { poolTaskPartion } = require('./poolTaskPartion/poolTaskParttion.js');

const reportTask = async (req, res) => {
    const value = await poolTaskPartion(req, res);
    res.status(200).json({ value });
}

module.exports = { reportTask };
