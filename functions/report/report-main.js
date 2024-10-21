const { poolTaskPartion } = require('./poolTaskPartion/poolTaskParttion');
const { userPerformanceMatrix } = require('./performance matrix/userPerformanceMatrix');
const { taskDeliveryMatrix } = require('./task delivery metrix/tdm');
const { timeBaseReport } = require('./time base report/timeBaseeport');

const reportMain = async (req, res) => {
    try {
        const poolTaskPartionResult = await poolTaskPartion(req, res);
        const userPerformanceMatrixResult = await userPerformanceMatrix(req, res);
        const taskDeliveryMatrixResult = await taskDeliveryMatrix(req, res);
        const timeBaseReportResult = await timeBaseReport(req, res);

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
