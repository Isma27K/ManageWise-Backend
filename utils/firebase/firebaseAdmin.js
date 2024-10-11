const admin = require('firebase-admin');
const serviceAccount = require('../../credentials/managewise-service-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const authAdmin = admin.auth();

module.exports = { authAdmin };
