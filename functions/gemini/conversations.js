const Mongob = require('../../utils/mongodb/mongodb.js');
const { ObjectId } = require('mongodb');

const getConversations = async (req, res) => {
    const uid = req.user.uid;
    
    try {
        const conversations = await Mongob('ManageWise', 'conversations', async (collection) => {
            return await collection.find({ 
                userId: uid 
            })
            .sort({ lastUpdated: -1 })
            .toArray();
        });
        
        return res.status(200).json({ conversations });
    } catch (error) {
        return res.status(500).json({ 
            error: "Failed to fetch conversations",
            details: error.message 
        });
    }
};

const deleteConversation = async (req, res) => {
    const { conversationId } = req.body;
    const uid = req.user.uid;
    
    try {
        await Mongob('ManageWise', 'conversations', async (collection) => {
            await collection.deleteOne({ 
                _id: new ObjectId(conversationId),
                userId: uid 
            });
        });
        
        return res.status(200).json({ 
            message: "Conversation deleted successfully" 
        });
    } catch (error) {
        return res.status(500).json({ 
            error: "Failed to delete conversation",
            details: error.message 
        });
    }
};

module.exports = { getConversations, deleteConversation };
