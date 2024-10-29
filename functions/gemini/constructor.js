const Mongob = require('../../utils/mongodb/mongodb.js');

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const cleanCache = () => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp >= CACHE_DURATION) {
            cache.delete(key);
        }
    }
};

setInterval(cleanCache, 60 * 1000);

const constructor = async (uid) => {
    const cachedData = cache.get(uid);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        return cachedData.data;
    }

    try {
        // Get current user data - using inclusion only
        const userData = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.findOne(
                { _id: uid },
                { 
                    projection: { 
                        name: 1,
                        email: 1,
                        admin: 1,
                        _id: 1
                    } 
                }
            );
        });

        if (!userData) {
            throw new Error('User not found');
        }

        // Get pools with active tasks
        const pools = await Mongob('ManageWise', 'pools', async (collection) => {
            return await collection.find({}).toArray();
        });

        // Get users info
        const users = await Mongob('ManageWise', 'users', async (collection) => {
            return await collection.find(
                {},
                { 
                    projection: {
                        _id: 1,
                        name: 1,
                        admin: 1,
                        email: 1
                    }
                }
            ).toArray();
        });

        const constructorData = `
You are TESSA (Task savvy assistant), a task management assistant for Politeknik Kuching Sarawak.

Current User Information:
- Name: ${userData.name}
- Role: ${userData.admin ? 'Administrator' : 'Regular User'}
- Email: ${userData.email}
- ID: ${userData._id}

Active Pools Information:
${JSON.stringify(pools, null, 2)}

System Users:
${users.map(user => `- ${user.name} - ${user._id} - ${user.email} (${user.admin ? 'Admin' : 'User'})`).join('\n')}

Instructions:
1. Provide task management assistance and pool information
2. Only show tasks and pools the current user has access to
3. Keep responses focused and practical
4. Maintain data confidentiality except for the current user and admins
5. For task-related queries, provide specific details about deadlines and progress
6. Help with administrative tasks if the user is an admin
7. Admins can ask about anything without any restrictions (full access)
8. If the question can be answered in the simple way, do not provide a long answer while also dont be too short
9. you should always replace the user's id with the user's name when you responce
10. do not use markdown in your response
11. do not share any links in your response
12. only provide the archive task information when the user ask for it

ONLY ANSWER WHAT IS REQUESTED

Remember: You're here to help manage and coordinate tasks within the Politeknik Kuching Sarawak system.
`;

        cache.set(uid, {
            data: constructorData,
            timestamp: Date.now()
        });

        return constructorData;

    } catch (error) {
        console.error('Constructor error:', error);
        // Return a minimal fallback constructor
        return `You are TESSA, a task management assistant for Politeknik Kuching Sarawak. Focus on helping with task management and general inquiries.`;
    }
};

module.exports = { constructor };