const Mongob = require('../../../utils/mongodb/mongodb.js');

//userPerformanceMetrics: {
//    taskCompletionRate: 0.85,
//    topPerformers: [
//        { Pool: 'TEST 2', tasksCompleted: 45 },
//        { Pool: 'TEST', tasksCompleted: 38 },
//        { Pool: 'MULTIMEDIA', tasksCompleted: 32 },
//    ],
//    averageCompletionTime: 2.5, // in days
//},

const calculateTaskCompletionRate = async (user) => {
    const result = await Mongob('ManageWise', 'pools', async (collection) => {
        return await collection.find({
            'tasks.contributor': user
        }).toArray();
    });

    let totalTasks = 0;
    let completedTasks = 0;

    result.forEach(pool => {
        pool.tasks.forEach(task => {
            if (task.contributor.includes(user)) {
                totalTasks++;
                if (task.isArchived) {
                    completedTasks++;
                }
            }
        });
    });

    const taskCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    return {
        userPerformanceMetrics: {
            taskCompletionRate: parseFloat(taskCompletionRate.toFixed(2)),
            totalTasks,
            completedTasks
        }
    };
}

const calculateAverageCompletionTime = async (user) => {

    const result = await Mongob('ManageWise', 'pools', async (collection) => {
        return await collection.find({
            'tasks.contributor': user,
            'tasks.isArchived': true
        }).toArray();
    });

    let totalCompletionTime = 0;
    let completedTasksCount = 0;

    result.forEach(pool => {
        pool.tasks.forEach(task => {
            if (task.contributor.includes(user) && task.isArchived) {
                const createdAt = new Date(task.createdAt);
                const archivedAt = new Date(task.archivedAt);
                if (!isNaN(createdAt) && !isNaN(archivedAt)) {
                    const completionTime = (archivedAt - createdAt) / (1000 * 60 * 60 * 24); // Convert to days
                    totalCompletionTime += completionTime;
                    completedTasksCount++;
                }
            }
        });
    });

    let averageCompletionTime = 0;
    let status = 'No completed tasks';

    if (completedTasksCount > 0) {
        averageCompletionTime = totalCompletionTime / completedTasksCount;
        status = 'Calculated';
    }

    // ======================= output =======================
    return {
        averageCompletionTime: parseFloat(averageCompletionTime.toFixed(2)),
        completedTasksCount,
    };
}

const findTopPools = async (user) => {
    const result = await Mongob('ManageWise', 'pools', async (collection) => {
        return await collection.find({
            'tasks.contributor': user,
            'tasks.isArchived': true
        }).toArray();
    });

    const poolCompletions = result.map(pool => {
        const completedTasks = pool.tasks.filter(task => 
            task.contributor.includes(user) && task.isArchived
        ).length;

        return {
            Pool: pool.name,
            tasksCompleted: completedTasks
        };
    });

    // Sort pools by completed tasks in descending order
    poolCompletions.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    // Return the top 7 pools or fewer if less than 7 pools are found
    return poolCompletions.slice(0, 7);
}

const userPerformanceMatrix = async (req, res) => {
    const user = req.user.uid;

    const taskCompletionMetrics = await calculateTaskCompletionRate(user);
    const completionTimeMetrics = await calculateAverageCompletionTime(user);
    const topPools = await findTopPools(user);

    const result = {
        userPerformanceMetrics: {
            ...taskCompletionMetrics.userPerformanceMetrics,
            ...completionTimeMetrics,
            topPerformers: topPools
        }
    };

    return result;
}

module.exports = { userPerformanceMatrix };