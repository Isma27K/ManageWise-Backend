const { poolTaskPartion } = require('./poolTaskPartion/poolTaskParttion');
const { userPerformanceMatrix } = require('./performance matrix/userPerformanceMatrix');
const { taskDeliveryMatrix } = require('./task delivery metrix/tdm');
const { timeBaseReport } = require('./time base report/timeBaseeport');

const reportMain = async (req, res) => {
    try {
        const { selectUser } = req.body;
        const targetUser = req.user.admin && selectUser ? selectUser : req.user.uid;

        const poolTaskPartionResult = await poolTaskPartion(req, res, targetUser);
        const userPerformanceMatrixResult = await userPerformanceMatrix(req, res, targetUser);
        const taskDeliveryMatrixResult = await taskDeliveryMatrix(req, res, targetUser);
        const timeBaseReportResult = await timeBaseReport(req, res, targetUser);

        res.status(200).json({
            ...poolTaskPartionResult,
            ...userPerformanceMatrixResult,
            ...taskDeliveryMatrixResult,
            ...timeBaseReportResult
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
