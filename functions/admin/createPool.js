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
            const emailSubject = `You've been added to a new pool: ${poolName}`;
            const emailContent = `
                <h2>Hello ${contributor.name},</h2>
                <p>You have been added to a new pool in ManageWise.</p>
                <p><strong>Pool Name:</strong> ${poolName}</p>
                <p><strong>Pool Description:</strong> ${poolDescription}</p>
                <p>Log in to your ManageWise account to view and manage tasks in this new pool.</p>
                <p>Best regards,<br>The ManageWise Team</p>
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
