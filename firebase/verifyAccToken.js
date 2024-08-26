// firebaseValidator.js
const admin = require('firebase-admin');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // Optionally, you can specify the Firebase project ID if not using applicationDefault
  // projectId: 'your-project-id',
});

async function verifyToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken; // Returns the decoded token if valid
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = verifyToken;
