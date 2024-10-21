const Mongob = require('../../../utils/mongodb/mongodb.js');

const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

const timeBaseReport = async (req, res) => {
    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            const pools = await collection.find({}).toArray();
            
            const currentDate = new Date();
            const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Initialize data structures
            const tasksOverTime = {};
            let weeklyTasksCompleted = 0;
            let monthlyTasksCompleted = 0;
            let weeklyOnTimeCompletions = 0;
            let monthlyOnTimeCompletions = 0;
            let weeklyTaskAges = [];
            let monthlyTaskAges = [];
            const projectTaskCounts = {};

            // Process each pool and its tasks
            pools.forEach(pool => {
                pool.tasks.forEach(task => {
                    const createdDate = parseDate(task.createdAt);
                    const archivedDate = parseDate(task.archivedAt);
                    const dueDate = new Date(task.dueDate[1]);

                    if (!createdDate) {
                        console.warn(`Skipping task ${task.id} due to invalid created date`);
                        return;
                    }

                    // Process tasks over time
                    const dateKey = createdDate.toISOString().split('T')[0];
                    if (!tasksOverTime[dateKey]) {
                        tasksOverTime[dateKey] = { created: 0, started: 0, completed: 0 };
                    }
                    tasksOverTime[dateKey].created++;
                    if (task.progress && task.progress.length > 0) tasksOverTime[dateKey].started++;
                    if (task.isArchived && archivedDate) {
                        tasksOverTime[dateKey].completed++;
                        
                        // Weekly report data
                        if (archivedDate >= oneWeekAgo) {
                            weeklyTasksCompleted++;
                            if (archivedDate <= dueDate) weeklyOnTimeCompletions++;
                            weeklyTaskAges.push((archivedDate - createdDate) / (1000 * 60 * 60 * 24));
                        }
                        
                        // Monthly report data
                        if (archivedDate >= oneMonthAgo) {
                            monthlyTasksCompleted++;
                            if (archivedDate <= dueDate) monthlyOnTimeCompletions++;
                            monthlyTaskAges.push((archivedDate - createdDate) / (1000 * 60 * 60 * 24));
                        }
                    }

                    // Count tasks per project (pool)
                    if (!projectTaskCounts[pool.name]) projectTaskCounts[pool.name] = 0;
                    projectTaskCounts[pool.name]++;
                });
            });

            // Convert tasksOverTime to array and sort by date
            const tasksOverTimeArray = Object.entries(tasksOverTime).map(([date, counts]) => ({
                date,
                ...counts
            })).sort((a, b) => new Date(a.date) - new Date(b.date));

            // Calculate most active project
            const mostActiveProject = Object.entries(projectTaskCounts).length > 0
                ? Object.entries(projectTaskCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                : 'No active projects';

            const weeklyReport = {
                tasksCompleted: weeklyTasksCompleted,
                onTimeCompletionRate: weeklyTasksCompleted > 0 ? parseFloat((weeklyOnTimeCompletions / weeklyTasksCompleted).toFixed(2)) : 0,
                averageTaskAge: weeklyTaskAges.length > 0 ? parseFloat((weeklyTaskAges.reduce((a, b) => a + b, 0) / weeklyTaskAges.length).toFixed(1)) : 0,
                mostActiveProject: mostActiveProject,
            };

            const monthlyReport = {
                tasksCompleted: monthlyTasksCompleted,
                onTimeCompletionRate: monthlyTasksCompleted > 0 ? parseFloat((monthlyOnTimeCompletions / monthlyTasksCompleted).toFixed(2)) : 0,
                averageTaskAge: monthlyTaskAges.length > 0 ? parseFloat((monthlyTaskAges.reduce((a, b) => a + b, 0) / monthlyTaskAges.length).toFixed(1)) : 0,
                mostActiveProject: mostActiveProject,
            };

            return {
                timeBased: {
                    tasksOverTime: tasksOverTimeArray,
                    weeklyReport: weeklyReport,
                    monthlyReport: monthlyReport,
                },
            };
        });

        return result;
    } catch (error) {
        console.error('Error in timeBaseReport:', error);
        throw error;
    }
}

module.exports = { timeBaseReport }
