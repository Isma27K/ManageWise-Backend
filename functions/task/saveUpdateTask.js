const Mongob = require('../../utils/mongodb/mongodb.js');
const path = require('path');

const saveUpdateTask = async (req, res) => {
    //console.log('Received request body:', req.body);

    const { id, description, dueDate, contributor, poolId } = req.body;

    if (!poolId) {
        //console.log('poolId is missing from the request body');
        return res.status(400).json({ error: 'poolId is required' });
    }

    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {

            // Find the pool by poolId (using UUID string directly)
            const pool = await collection.findOne({ _id: poolId });

            //console.log('Found pool:', pool);

            if (!pool) {
                //console.log('Pool not found');
                return { error: 'Pool not found' };
            }

            // Find the task index in the pool's tasks array
            const taskIndex = pool.tasks.findIndex(task => task.id === id);

            if (taskIndex === -1) {
                return { error: 'Task not found in the pool' };
            }

            // Update the task
            const updatedTask = {
                ...pool.tasks[taskIndex],
                description,
                dueDate,
                contributor
            };

            // Update the task in the pool's tasks array
            pool.tasks[taskIndex] = updatedTask;

            // Update the pool document in the database
            const updateResult = await collection.updateOne(
                { _id: poolId },
                { $set: { tasks: pool.tasks } }
            );

            if (updateResult.modifiedCount === 1) {
                return { message: 'Task updated successfully', updatedTask };
            } else {
                return { error: 'Failed to update task' };
            }
        });

        if (result.error) {
            console.log('Error:', result.error);
            res.status(404).json(result);
        } else {
            console.log('Task updated successfully');
            res.status(200).json(result);
        }
    } catch (error) {
        console.log('Caught error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { saveUpdateTask };
