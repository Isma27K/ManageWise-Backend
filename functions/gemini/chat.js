const {GoogleGenerativeAI} = require("@google/generative-ai");
const Mongob = require('../../utils/mongodb/mongodb.js');
const {constructor} = require('./constructor.js');
const { ObjectId } = require('mongodb');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const chat = async (req, res) => {
    const { message, conversationId, newConversation } = req.body;
    const uid = req.user.uid;

    try {
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
            
            if (!newConversation && conversationId) {
                if (!ObjectId.isValid(conversationId)) {
                    throw new Error("Invalid conversation ID format");
                }
                
                try {
                    const objectId = new ObjectId(conversationId);
                    conversation = await collection.findOne({ 
                        _id: objectId,
                        userId: uid 
                    });
                } catch (error) {
                    console.log('Conversation lookup error:', error);
                    conversation = null;
                }
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

        const constructorData = await constructor(uid);
        
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash-002",
                    systemInstruction: constructorData
                });
            
                const generationConfig = {
                    temperature: 0.7, // Reduced from 1
                    topP: 0.8,      // Reduced from 0.95
                    topK: 40,
                    maxOutputTokens: 4096, // Reduced from 8192
                    responseMimeType: "text/plain",
                };
            
                const chatSession = model.startChat({
                    generationConfig,
                    history: chatHistory.history.slice(-10), // Only keep last 10 messages
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
                if (error.status === 503 && retries < MAX_RETRIES - 1) {
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
                    continue;
                }
                
                console.error('Chat error:', error);
                return res.status(error.status || 500).json({ 
                    error: "Failed to process chat request",
                    details: error.status === 503 ? 
                        "AI service is temporarily unavailable. Please try again in a moment." : 
                        error.message
                });
            }
        }

    } catch (error) {
        console.error('Chat error:', error);
        if (error.message === "Invalid conversation ID format") {
            return res.status(400).json({
                error: "Invalid conversation ID format"
            });
        }
        return res.status(500).json({ 
            error: "Failed to process chat request",
            details: error.message 
        });
    }
}

module.exports = { chat };

  
