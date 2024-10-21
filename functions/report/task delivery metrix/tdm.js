const Mongob = require('../../../utils/mongodb/mongodb.js');

const taskDeliveryMatrix = async (req, res, targetUser) => {
    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.find({
                'tasks': {
                    $elemMatch: {
                        'contributor': targetUser,
                        'isArchived': true
                    }
                }
            }).toArray();
        });

        let totalTasks = 0;
        let onTimeTasks = 0;
        let delayedTasks = 0;
        let taskEscalations = 0;

        result.forEach(pool => {
            pool.tasks.forEach(task => {
                if (task.contributor.includes(targetUser) && task.isArchived) {
                    totalTasks++;

                    const dueDate = new Date(task.dueDate[1]);
                    const archivedAt = new Date(task.archivedAt.$date);

                    // Adjust the year of archivedAt to match the dueDate year
                    archivedAt.setFullYear(dueDate.getFullYear());

                    if (archivedAt <= dueDate) {
                        onTimeTasks++;
                    } else {
                        delayedTasks++;
                    }

                    // Check for task escalations (assuming escalation if more than one contributor)
                    if (task.contributor.length > 1) {
                        taskEscalations++;
                    }
                }
            });
        });

        const onTimeDeliveryRate = totalTasks > 0 ? onTimeTasks / totalTasks : 0;

        const taskDeliveryMetrics = {
            onTimeDeliveryRate: parseFloat(onTimeDeliveryRate.toFixed(2)),
            delayedTasks: delayedTasks,
            taskEscalations: taskEscalations,
        };

        return { taskDeliveryMetrics };

    } catch (error) {
        console.error('Error in taskDeliveryMatrix:', error);
        throw error; 
    }
}

module.exports = { taskDeliveryMatrix }
