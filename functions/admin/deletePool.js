const Mongob = require('../../utils/mongodb/mongodb.js');
const sendEmail = require('../email/email.js');


const deletePool = async (req, res) => {
    const { poolId } = req.body;
    const userId = req.user.uid;  // Get the user ID from the request

    try {
        // Get pool details before deletion
        const pool = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.findOne({ _id: poolId });
        });

        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }

        if (pool.tasks && pool.tasks.length > 0) {
            return res.status(400).json({ error: 'Cannot delete pool with tasks' });
        }

        // Get the user who is deleting the pool
        const deletingUser = await Mongob('ManageWise', 'users', async (userCollection) => {
            return await userCollection.findOne({ _id: userId });
        });

        if (!deletingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all pool contributors
        const contributors = await Mongob('ManageWise', 'users', async (userCollection) => {
            return await userCollection.find({ 
                _id: { $in: pool.userIds }
            }).toArray();
        });

        // Delete the pool
        const deleteResult = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.deleteOne({ _id: poolId });
        });

        if (deleteResult.deletedCount === 1 && contributors.length > 0) {
            const contributorEmails = contributors.map(contributor => contributor.email);
            
            const emailSubject = `Pool Permanently Deleted: ${pool.name}`;
            const emailContent = `
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #4a4a4a;">Pool Permanently Deleted</h2>
                    <p>The pool "<strong>${pool.name}</strong>" has been permanently deleted by <strong>${deletingUser.name}</strong>.</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Deleted Pool Details:</h3>
                        <p><strong>Pool Name:</strong> ${pool.name}</p>
                        <p><strong>Description:</strong> ${pool.description || 'No description provided'}</p>
                        <p><strong>Created Date:</strong> ${new Date(pool.createdAt).toLocaleString()}</p>
                        <p><strong>Deleted By:</strong> ${deletingUser.name}</p>
                        <p><strong>Deletion Date:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Number of Contributors:</strong> ${pool.userIds.length}</p>
                    </div>
                    <p style="color: #e74c3c;"><strong>Important Note:</strong> This action is permanent and the pool cannot be recovered. All associated data has been permanently deleted.</p>
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba;">
                        <p style="color: #856404; margin: 0;">If you believe this pool was deleted in error, please contact your system administrator immediately.</p>
                    </div>
                    <p style="margin-top: 30px;">Best regards,<br><strong>The ManageWise Team</strong></p>
                </body>
                </html>
            `;

            try {
                await sendEmail(contributorEmails, emailSubject, emailContent, emailContent);
                console.log(`Pool deletion notification sent to all contributors`);
            } catch (error) {
                console.error('Error sending pool deletion notification email:', error);
            }
        }

        res.status(200).json({ 
            message: 'Pool deleted successfully',
            deletedBy: deletingUser.name
        });
    } catch (error) {
        console.error('Error in deletePool:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}


module.exports = { deletePool };
