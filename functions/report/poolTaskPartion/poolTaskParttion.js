const Mongob = require('../../../utils/mongodb/mongodb.js');


const poolTaskPartion = async (req, res) => {
    const {selectUser} = req.body;
    const user = "";

    if (req.user.admin && selectUser) {
        user = selectUser;
    }else{
        user = req.user.uid;
    }
    
    const result = await Mongob('ManageWise', 'pools', async (collection) => {
        return await collection.find({
            'tasks': {
                $elemMatch: {
                    'contributor': user
                }
            }
        }).toArray();
    });

    // Transform the result into the desired format
    const taskCompletionSummary = {
        statusBreakdown: result.map(pool => ({
            status: pool.name,
            count: pool.tasks.filter(task => task.contributor.includes(user)).length
        }))
    };

    return { taskCompletionSummary };
}

module.exports = { poolTaskPartion };
