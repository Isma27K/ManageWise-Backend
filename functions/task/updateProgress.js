const Mongob = require('../../utils/mongodb/mongodb.js');
const path = require('path');


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
            link: path.join('uploads', req.file.filename) // This will be the path relative to the project root
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

