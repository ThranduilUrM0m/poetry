const admin = require('firebase-admin');
const serviceAccount = require('../firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: serviceAccount.storageBucket,
});

const bucket = admin.storage().bucket();
module.exports = bucket;
