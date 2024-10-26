const Mongob = require('../../utils/mongodb/mongodb.js');
const sendEmail = require('../email/email.js');

const deleteTask = async (req, res) => {
    const { poolId, taskId } = req.body;
    const userId = req.user.uid;  // Get the user ID from the request

    try {
        if (!poolId || !taskId) {
            return res.status(400).json({ error: 'Missing poolId or taskId' });
        }

        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            // First, get the pool and task details before deletion
            const pool = await collection.findOne({ _id: poolId });
            if (!pool) {
                return { error: 'Pool not found' };
            }

            const task = pool.tasks.find(t => t.id === parseInt(taskId));
            if (!task) {
                return { error: 'Task not found' };
            }

            // Get the user who is deleting the task
            const deletingUser = await Mongob('ManageWise', 'users', async (userCollection) => {
                return await userCollection.findOne({ _id: userId });
            });

            if (!deletingUser) {
                return { error: 'User not found' };
            }

            // Delete the task
            const deleteResult = await collection.findOneAndUpdate(
                { _id: poolId },
                { $pull: { tasks: { id: parseInt(taskId) } } },
                { returnDocument: 'after' }
            );

            if (!deleteResult) {
                return { error: 'Failed to delete task' };
            }

            // Get all contributors from task.contributor array
            const contributors = await Mongob('ManageWise', 'users', async (userCollection) => {
                return await userCollection.find({ 
                    _id: { $in: task.contributor }
                }).toArray();
            });

            if (contributors.length > 0) {
                const contributorEmails = contributors.map(contributor => contributor.email);
                
                const emailSubject = `Task Permanently Deleted: ${task.name}`;
                const emailContent = `
                    <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #4a4a4a;">Task Permanently Deleted</h2>
                        <p>The task "<strong>${task.name}</strong>" in pool "<strong>${pool.name}</strong>" has been permanently deleted by <strong>${deletingUser.name}</strong>.</p>
                        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; margin-top: 0;">Deleted Task Details:</h3>
                            <p><strong>Task Name:</strong> ${task.name}</p>
                            <p><strong>Pool:</strong> ${pool.name}</p>
                            <p><strong>Description:</strong> ${task.description}</p>
                            <p><strong>Due Date:</strong> ${task.dueDate[0]} to ${task.dueDate[1]}</p>
                            <p><strong>Deleted By:</strong> ${deletingUser.name}</p>
                            <p><strong>Deletion Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="color: #e74c3c;"><strong>Note:</strong> This action is permanent and the task cannot be recovered.</p>
                        <p>If you believe this task was deleted in error, please contact your pool administrator.</p>
                        <p style="margin-top: 30px;">Best regards,<br><strong>The ManageWise Team</strong></p>
                    </body>
                    </html>
                `;

                try {
                    await sendEmail(contributorEmails, emailSubject, emailContent, emailContent);
                    console.log(`Task deletion notification sent to all contributors`);
                } catch (error) {
                    console.error('Error sending deletion notification email:', error);
                }
            }

            return { 
                message: 'Task deleted successfully', 
                updatedPool: deleteResult,
                deletedBy: deletingUser.name 
            };
        });

        if (result.error) {
            return res.status(result.error.includes('not found') ? 404 : 500).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in deleteTask:', error);
        res.status(500).json({ error: 'An error occurred while deleting the task' });
    }
};

module.exports = { deleteTask };
