const {GoogleGenerativeAI} = require("@google/generative-ai");
const Mongob = require('../../utils/mongodb/mongodb.js');
const { ObjectId } = require('mongodb');

const chat = async (req, res) => {
    const { message, conversationId, newConversation } = req.body;
    const uid = req.user.uid;

    try {
        // Get user data from database
        const userData = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne({ _id: uid });
        });

        if (!userData?.hasApi || !userData?.apiKey) {
            return res.status(403).json({ 
                error: "No API key found. Please add your Gemini API key in settings." 
            });
        }

        // Get or create chat history
        const chatHistory = await Mongob('ManageWise', 'conversations', async (collection) => {
            let conversation;
            
            // If newConversation is true, always create a new conversation
            if (!newConversation && conversationId) {
                conversation = await collection.findOne({ 
                    _id: new ObjectId(conversationId),
                    userId: uid 
                });
            }
            
            if (!conversation) {
                conversation = {
                    userId: uid,
                    history: [],
                    createdAt: new Date(),
                    lastUpdated: new Date()
                };
                const result = await collection.insertOne(conversation);
                conversation._id = result.insertedId;
            }
            
            return conversation;
        });

        const genAI = new GoogleGenerativeAI(userData.apiKey);
        
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-002",
        });
    
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
    
        const chatSession = model.startChat({
            generationConfig,
            history: chatHistory.history,
        });
    
        const result = await chatSession.sendMessage(message);
        
        // Update chat history in database
        await Mongob('ManageWise', 'conversations', async (collection) => {
            const newMessage = {
                role: "user",
                parts: [{ text: message }]
            };
            const aiResponse = {
                role: "model",
                parts: [{ text: result.response.candidates[0].content.parts[0].text }]
            };

            await collection.updateOne(
                { _id: chatHistory._id },
                { 
                    $push: { 
                        history: { 
                            $each: [newMessage, aiResponse] 
                        }
                    },
                    $set: { lastUpdated: new Date() }
                }
            );
        });

        return res.status(200).json({ 
            message: result.response,
            conversationId: chatHistory._id
        });

    } catch (error) {
        return res.status(500).json({ 
            error: "Failed to process chat request",
            details: error.message 
        });
    }
}

module.exports = { chat };

  
