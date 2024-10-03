const { MongoClient } = require('mongodb');
require('dotenv').config();

// Replace with your MongoDB connection URI
const uri = process.env.MONGO_URI;

// Create a new MongoClient without deprecated options
const client = new MongoClient(uri);

module.exports = async function Mongob(dbName, collectionName, operationCallback) {
  try {
    // Check if the client is already connected
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect(); // Connect to MongoDB if not already connected
    }

    // Access the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Execute the operation passed as a callback
    if (operationCallback) {
      return await operationCallback(collection);
    }

    // Optionally, return the collection for further operations outside the function
    return collection;

  } catch (error) {
    console.error('MongoDB Operation Error:', error);
    throw error;
  }
};






// use case:

// const Mongob = require('./path-to-mongob-file');

// async function run() {
//   try {
    // Insert a document
//     const insertResult = await Mongob('testDB', 'myCollection', async (collection) => {
//       return await collection.insertOne({ name: 'Jane Doe', age: 25 });
//     });
//     console.log('Insert Result:', insertResult);

    // Find a document
//     const findResult = await Mongob('testDB', 'myCollection', async (collection) => {
//       return await collection.findOne({ name: 'Jane Doe' });
//     });
//     console.log('Find Result:', findResult);
//   } catch (error) {
//     console.error(error);
//   }
// }

// run();
