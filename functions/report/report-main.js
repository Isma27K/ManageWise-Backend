const { poolTaskPartion } = require('./poolTaskPartion/poolTaskParttion');

const reportMain = async (req, res) => {
    try {
        const poolTaskPartionResult = await poolTaskPartion(req, res);
        
        res.status(200).json({
            success: true,
            ...poolTaskPartionResult
        });
    } catch (error) {
        console.error('Error in reportMain:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating the report'
        });
    }
};

module.exports = { reportMain };
