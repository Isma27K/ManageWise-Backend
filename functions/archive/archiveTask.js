const Mongob = require('../../utils/mongodb/mongodb.js');
const sendEmail = require('../email/email.js');

const archiveTask = async (req, res) => {
    const { poolId, taskId } = req.body;
    const userId = req.user.uid;  // Get the user ID from the request

    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            // First, get the pool and task details before updating
            const pool = await collection.findOne({ _id: poolId });
            if (!pool) {
                return { error: 'Pool not found' };
            }

            const task = pool.tasks.find(t => t.id === parseInt(taskId));
            if (!task) {
                return { error: 'Task not found' };
            }

            // Get the user who is archiving the task
            const archivingUser = await Mongob('ManageWise', 'users', async (userCollection) => {
                return await userCollection.findOne({ _id: userId });
            });

            if (!archivingUser) {
                return { error: 'User not found' };
            }

            // Update the task with archiving details
            const updateResult = await collection.findOneAndUpdate(
                { _id: poolId, "tasks.id": parseInt(taskId) },
                { 
                    $set: { 
                        "tasks.$.isArchived": true, 
                        "tasks.$.archivedAt": new Date(),
                        "tasks.$.archivedBy": {
                            userId: archivingUser._id,
                            name: archivingUser.name
                        }
                    } 
                },
                { returnDocument: 'after' }
            );

            if (!updateResult) {
                return { error: 'Failed to archive task' };
            }

            // Get all contributors from task.contributor array
            const contributors = await Mongob('ManageWise', 'users', async (userCollection) => {
                return await userCollection.find({ 
                    _id: { $in: task.contributor }
                }).toArray();
            });

            if (contributors.length > 0) {
                const contributorEmails = contributors.map(contributor => contributor.email);
                
                const emailSubject = `Task Closed: ${task.name}`;
                const emailContent = `
                    <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #4a4a4a;">Task Closed</h2>
                        <p>The task "<strong>${task.name}</strong>" in pool "<strong>${pool.name}</strong>" has been marked as completed and archived by <strong>${archivingUser.name}</strong>.</p>
                        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; margin-top: 0;">Task Details:</h3>
                            <p><strong>Task Name:</strong> ${task.name}</p>
                            <p><strong>Pool:</strong> ${pool.name}</p>
                            <p><strong>Description:</strong> ${task.description}</p>
                            <p><strong>Due Date:</strong> ${task.dueDate[0]} to ${task.dueDate[1]}</p>
                            <p><strong>Archived By:</strong> ${archivingUser.name}</p>
                            <p><strong>Archived Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p>The task has been moved to the archive. You can still view it in the archive panel.</p>
                        <p>To view the archived task:</p>
                        <ol>
                            <li><a href="https://managewise.ratacode.top/login">Log in to ManageWise</a></li>
                            <li>Go to the Archive Panel</li>
                            <li>Find the task "${task.name}" under pool "${pool.name}"</li>
                        </ol>
                        <p>Thank you for your contribution to this task!</p>
                        <p style="margin-top: 30px;">Best regards,<br><strong>The ManageWise Team</strong></p>
                    </body>
                    </html>
                `;

                try {
                    await sendEmail(contributorEmails, emailSubject, emailContent, emailContent);
                    console.log(`Task archive notification sent to all contributors`);
                } catch (error) {
                    console.error('Error sending archive notification email:', error);
                }
            }

            return { 
                message: 'Task archived successfully', 
                updatedPool: updateResult,
                archivedBy: archivingUser.name 
            };
        });

        if (result.error) {
            return res.status(result.error.includes('not found') ? 404 : 500).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in archiveTask:', error);
        res.status(500).json({ error: 'An error occurred while archiving the task' });
    }
};

module.exports = { archiveTask };
