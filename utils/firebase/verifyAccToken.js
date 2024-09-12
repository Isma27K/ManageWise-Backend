// firebaseValidator.js
const admin = require('firebase-admin');
const serviceAccount = require('../../credentials/managewise-service-key.json');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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
