const { poolTaskPartion } = require('./poolTaskPartion/poolTaskParttion');
const { userPerformanceMatrix } = require('./performance matrix/userPerformanceMatrix');
const { taskDeliveryMatrix } = require('./task delivery metrix/tdm');
const { timeBaseReport } = require('./time base report/timeBaseeport');

const reportMain = async (req, res) => {
    try {
        const { selectUser } = req.body;
        const targetUser = req.user.admin && selectUser ? selectUser : req.user.uid;

        const [poolTaskPartionResult, userPerformanceMatrixResult, taskDeliveryMatrixResult, timeBaseReportResult] = await Promise.all([
            poolTaskPartion(req, res, targetUser),
            userPerformanceMatrix(req, res, targetUser),
            taskDeliveryMatrix(req, res, targetUser),
            timeBaseReport(req, res, targetUser)
        ]);

        // Check if the response has already been sent
        if (res.headersSent) {
            return;
        }

        res.status(200).json({
            ...poolTaskPartionResult,
            ...userPerformanceMatrixResult,
            ...taskDeliveryMatrixResult,
            ...timeBaseReportResult
        });
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'An error occurred while generating the report',
                requestId,
                targetUser
            });
        }
    }
};

module.exports = { reportMain };
