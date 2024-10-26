const Mongob = require('../../utils/mongodb/mongodb.js');
const path = require('path');
const sendEmail = require('../email/email.js');

const updateProgress = async (req, res) => {
    const { title, description, CID, taskID, poolID } = req.body;
    let attachment = null;

    if (!taskID || !CID || !poolID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Handle file upload if present
    if (req.file) {
        attachment = {
            name: req.file.originalname,
            link: path.join('uploads', req.file.filename)
        };
    }

    try {
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            const pool = await collection.findOne({ _id: poolID });

            if (!pool) {
                return { error: 'Pool not found' };
            }

            const task = pool.tasks.find(t => t.id === parseInt(taskID));
            if (!task) {
                return { error: 'Task not found' };
            }

            const newProgress = {
                id: task.progress ? task.progress.length + 1 : 1,
                CID,
                detail: title,
                description,
                linkAttachment: attachment ? [attachment] : [],
                date: new Date().toISOString()
            };

            // Update only the task-specific progress
            const updateResult = await collection.updateOne(
                { _id: poolID, "tasks.id": parseInt(taskID) },
                { 
                    $push: { 
                        "tasks.$.progress": newProgress
                    }
                }
            );
            
            if (updateResult.modifiedCount === 1) {
                // Get all contributors from task.contributor array
                const contributors = await Mongob('ManageWise', 'users', async (collection) => {
                    return await collection.find({ 
                        _id: { $in: task.contributor }
                    }).toArray();
                });

                // Get the updater's details
                const updater = contributors.find(c => c._id === CID);
                if (!updater) {
                    console.error('Updater not found in contributors list');
                    return { message: 'Progress added successfully', progress: newProgress };
                }

                if (contributors.length > 0) {
                    const contributorEmails = contributors.map(contributor => contributor.email);
                    
                    const emailSubject = `Progress Update: ${task.name}`;
                    const emailContent = `
                        <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2 style="color: #4a4a4a;">Progress Update</h2>
                            <p><strong>${updater.name}</strong> has added a new progress update to the task "<strong>${task.name}</strong>" in pool "<strong>${pool.name}</strong>".</p>
                            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0;">Update Details:</h3>
                                <p><strong>Title:</strong> ${title}</p>
                                <p><strong>Description:</strong> ${description}</p>
                                ${attachment ? `<p><strong>Attachment:</strong> ${attachment.name}</p>` : ''}
                                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            <p>To view the complete progress and details:</p>
                            <ol>
                                <li><a href="https://managewise.ratacode.top/login">Log in to ManageWise</a></li>
                                <li>Navigate to pool "${pool.name}"</li>
                                <li>Open task "${task.name}"</li>
                            </ol>
                            <p style="margin-top: 30px;">Best regards,<br><strong>The ManageWise Team</strong></p>
                        </body>
                        </html>
                    `;

                    try {
                        await sendEmail(contributorEmails, emailSubject, emailContent, emailContent);
                        console.log(`Progress update email sent to all task contributors`);
                    } catch (error) {
                        console.error('Error sending progress update email:', error);
                    }
                }

                return { message: 'Progress added successfully', progress: newProgress };
            } else {
                return { error: 'Failed to add progress' };
            }
        });

        if (result.error) {
            return res.status(result.error === 'Pool not found' ? 404 : 500).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateProgress:', error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = { updateProgress };
