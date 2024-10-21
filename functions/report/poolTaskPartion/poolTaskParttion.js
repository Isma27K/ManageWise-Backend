const Mongob = require('../../../utils/mongodb/mongodb.js');


const poolTaskPartion = async (req, res, targetUser) => {
    const result = await Mongob('ManageWise', 'pools', async (collection) => {
        return await collection.find({
            'tasks': {
                $elemMatch: {
                    'contributor': targetUser
                }
            }
        }).toArray();
    });

    // Transform the result into the desired format
    const taskCompletionSummary = {
        statusBreakdown: result.map(pool => ({
            status: pool.name,
            count: pool.tasks.filter(task => task.contributor.includes(targetUser)).length
        }))
    };

    return { taskCompletionSummary };
}

module.exports = { poolTaskPartion };
