const { poolTaskPartion } = require('./poolTaskPartion/poolTaskParttion');
const { userPerformanceMatrix } = require('./performance matrix/userPerformanceMatrix');
const { taskDeliveryMatrix } = require('./task delivery metrix/tdm');
const { timeBaseReport } = require('./time base report/timeBaseeport');
const { theGreatTaskFilter } = require('./theGreatTaskFilter/theGreateTaskFilter');

const reportMain = async (req, res) => {
    const requestId = Date.now(); // Generate a unique ID for this request
    try {
        const { selectUser } = req.body;
        const targetUser = req.user.admin && selectUser ? selectUser : req.user.uid;

        const [poolTaskPartionResult, userPerformanceMatrixResult, taskDeliveryMatrixResult, theGreatTaskFilterResult] = await Promise.all([
            poolTaskPartion(req, res, targetUser),
            userPerformanceMatrix(req, res, targetUser),
            taskDeliveryMatrix(req, res, targetUser),
            theGreatTaskFilter(req, res, targetUser)
        ]);

        // Combine all results
        const combinedResult = {
            requestId,
            targetUser,
            poolTaskPartion: poolTaskPartionResult,
            userPerformanceMatrix: userPerformanceMatrixResult,
            taskDeliveryMatrix: taskDeliveryMatrixResult,
            theGreatTaskFilter: theGreatTaskFilterResult
        };

        // Send the combined result
        res.status(200).json(combinedResult);
    } catch (error) {
        console.error(`Error in reportMain for user ${targetUser} (Request ID: ${requestId}):`, error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating the report',
            requestId,
            targetUser
        });
    }
};

module.exports = { reportMain };
