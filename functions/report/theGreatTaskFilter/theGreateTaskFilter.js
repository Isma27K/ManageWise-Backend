const Mongob = require('../../../utils/mongodb/mongodb.js');

const theGreatTaskFilter = async (req, res, targetUser) => {
    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            const pools = await collection.find({}).toArray();
            
            let completedTasks = [];
            let incompleteTasks = [];

            pools.forEach(pool => {
                pool.tasks.forEach(task => {
                    if (task.contributor.includes(targetUser)) {
                        const taskWithPoolInfo = {
                            ...task,
                            poolName: pool.name,
                            poolId: pool._id
                        };

                        if (task.isArchived) {
                            completedTasks.push(taskWithPoolInfo);
                        } else {
                            incompleteTasks.push(taskWithPoolInfo);
                        }
                    }
                });
            });

            return {
                completedTasks,
                incompleteTasks
            };
        });

        return result; // Return the result instead of sending a response
    } catch (error) {
        console.error('Error in theGreatTaskFilter:', error);
        throw error; // Throw the error to be caught in the main function
    }
}

module.exports = {theGreatTaskFilter};
