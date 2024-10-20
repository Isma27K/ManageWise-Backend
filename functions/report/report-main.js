

const reportTask = async (req, res) => {
    res.status(200).json({ message: 'Report task' });
}

module.exports = { reportTask };
