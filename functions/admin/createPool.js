const { v4: uuidv4 } = require('uuid');
const Mongob = require('../../utils/mongodb/mongodb.js');
const sendEmail = require('../email/email.js');


const adminCreatePool = async (req, res) => {
    const { poolName, poolDescription, userId } = req.body;

    if (!req.user.admin) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    try {
        const user = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne({_id: req.user.uid});
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.admin) {
            return res.status(401).json({ error: 'You are not authorized to do so' });
        }

        // Check if userIds is an array if provided
        if (userId !== undefined && (!Array.isArray(userId) || userId.some(id => typeof id !== 'string'))) {
            return res.status(400).json({ error: 'userIds must be an array of strings' });
        }

        // Check if a pool with the same name (case-insensitive) already exists
        const existingPool = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.findOne({ name: { $regex: new RegExp(`^${poolName}$`, 'i') } });
        });

        if (existingPool) {
            return res.status(409).json({ error: 'A pool with this name already exists' });
        }

        const poolId = uuidv4();

        await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.insertOne({
                _id: poolId,
                name: poolName,
                description: poolDescription,
                userIds: userId || [], // Use an empty array if userIds is not provided
                tasks: [],
                createdAt: new Date()
            }); 
        });

        // Fetch user details for all contributors
        const contributors = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.find({ _id: { $in: userId || [] } }).toArray();
        });

        // Send emails to all contributors
        for (const contributor of contributors) {
            const emailSubject = `Welcome to Your New ManageWise Pool: ${poolName}`;
            const emailContent = `
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #4a4a4a;">Hello ${contributor.name},</h2>
                    <p>Great news! You've been added to ${poolName} pool in ManageWise.</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Pool Details:</h3>
                        <p><strong>Name:</strong> ${poolName}</p>
                        <p><strong>Description:</strong> ${poolDescription}</p>
                    </div>
                    <h3 style="color: #2c3e50;">What's Next?</h3>
                    <ol>
                        <li><a href="https://managewise.ratacode.top/login">Log in to your ManageWise account</a></li>
                        <li>Find "${poolName}" in your list of pools</li>
                        <li>Start collaborating with your team!</li>
                    </ol>
                    <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                    <p>We're excited to see what you'll accomplish in this new pool!</p>
                    <p style="margin-top: 30px;">Best regards,<br><strong>The ManageWise Team</strong></p>
                </body>
                </html>
            `;

            try {
                await sendEmail(contributor.email, emailSubject, emailContent, emailContent);
                console.log(`Email sent successfully to ${contributor.email}`);
            } catch (error) {
                console.error(`Failed to send email to ${contributor.email}:`, error);
            }
        }

        res.status(200).json({ message: "Pool created successfully", poolId: poolId });
    } catch (error) {
        console.error('Error in adminCreatePool:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

module.exports = { adminCreatePool };
