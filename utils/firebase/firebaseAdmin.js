// admin.js
const admin = require('firebase-admin');
const serviceAccount = require('../../credentials/managewise-service-key.json'); // Replace with your Firebase Admin SDK JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authAdmin = admin.auth();

module.exports = { authAdmin };
