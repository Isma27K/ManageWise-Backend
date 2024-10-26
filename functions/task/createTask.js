const Mongob = require('../../utils/mongodb/mongodb.js');
const path = require('path');
const sendEmail = require('../email/email.js');

const createTask = async (req, res) => {
    try {
        const { name, description, dueDate, poolId, submitters } = req.body;

        if (!name || !description || !dueDate || !poolId || !submitters) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Handle file attachments
        const attachments = req.files ? req.files.map(file => ({
            name: file.originalname,
            link: path.join('uploads', file.filename)
        })) : [];

        // Parse dueDate and submitters
        const parsedDueDate = JSON.parse(dueDate);
        const parsedSubmitters = JSON.parse(submitters);

        // Use Mongob to perform the database operation
        const result = await Mongob('ManageWise', 'pools', async (collection) => {
            // Find the pool by ID
            const pool = await collection.findOne({ _id: poolId });

            if (!pool) {
                return { error: 'Pool not found' };
            }

            // Create the new task
            const newTask = {
                id: pool.tasks ? pool.tasks.length + 1 : 1,
                name,
                description,
                dueDate: parsedDueDate,
                progress: [],
                contributor: parsedSubmitters,
                attachments: attachments,
                isArchived: false,
                createdAt: new Date(),
                archivedAt: null
            };

            // Update the pool with the new task
            const updateResult = await collection.updateOne(
                { _id: poolId },
                { $push: { tasks: newTask } }
            );

            if (updateResult.modifiedCount === 1) {
                // Fetch user details for all contributors
                const contributors = await Mongob('ManageWise', 'users', async (collection) => {
                    return await collection.find({ _id: { $in: parsedSubmitters || [] } }).toArray();
                });

                // Extract contributor emails
                const contributorEmails = contributors.map(contributor => contributor.email);

                // Prepare email sending promises
                const emailPromises = contributors.map(contributor => {
                    const emailSubject = `New Task Assigned: ${name}`;
                    const emailContent = `
                        <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2 style="color: #4a4a4a;">Hello ${contributor.name},</h2>
                            <p>A new task has been assigned to you in the <strong>${pool.name}</strong> pool on ManageWise.</p>
                            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0;">Task Details:</h3>
                                <p><strong>Pool:</strong> ${pool.name}</p>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Description:</strong> ${description}</p>
                                <p><strong>Due Date:</strong> ${parsedDueDate[0]} to ${parsedDueDate[1]}</p>
                            </div>
                            <h3 style="color: #2c3e50;">What's Next?</h3>
                            <ol>
                                <li><a href="https://managewise.ratacode.top/login">Log in to your ManageWise account</a></li>
                                <li>Go to the "${pool.name}" pool</li>
                                <li>Find the task "${name}" and start working on it</li>
                            </ol>
                            <p>If you have any questions about this task or need assistance, please contact your pool administrator or our support team.</p>
                            <p>Good luck with your new task!</p>
                            <p style="margin-top: 30px;">Best regards,<br><strong>The ManageWise Team</strong></p>
                        </body>
                        </html>
                    `;

                    // Remove the current contributor's email from the CC list
                    const ccList = contributorEmails.filter(email => email !== contributor.email);

                    return sendEmail(contributor.email, emailSubject, emailContent, emailContent, ccList)
                        .then(() => console.log(`Email sent successfully to ${contributor.email}`))
                        .catch(error => console.error(`Failed to send email to ${contributor.email}:`, error));
                });

                // Send emails concurrently
                await Promise.all(emailPromises);

                return { message: 'Task created successfully', task: newTask };
            } else {
                return { error: 'Failed to create task' };
            }
        });

        if (result.error) {
            return res.status(result.error === 'Pool not found' ? 404 : 500).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in createTask:', error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = { createTask };
