const { handlePasswordReset } = require('../../utils/firebase/firebase.js');

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const result = await handlePasswordReset(email);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
}

module.exports = { forgetPassword };
