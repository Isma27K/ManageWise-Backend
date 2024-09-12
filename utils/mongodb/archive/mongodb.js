// Import the MongoDB client
const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017';

// Define your database and collection name
//const dbName = 'testDB';
//const collectionName = 'myCollection';

// Create a new MongoClient
const client = new MongoClient(uri);

module.exports = async function Mongob(dbName, collectionName) {
  try {
    // Connect the client to the server
    await client.connect();
    //console.log('Connected to MongoDB server');

    // Access the database
    const db = client.db(dbName);

    // Access the collection
    const collection = db.collection(collectionName);

    // Example: Insert a document
    //const insertResult = await collection.insertOne({ name: 'John Doe', age: 30 });
    //console.log('Insert Result:', insertResult);

    // Example: Find a document
    //const findResult = await collection.findOne({ name: 'John Doe' });
    //console.log('Find Result:', findResult);

    // Example: Update a document
    //const updateResult = await collection.updateOne(
    //  { name: 'John Doe' }, 
    //  { $set: { age: 31 } }
    //);
    //console.log('Update Result:', updateResult);

    // Example: Delete a document
    //const deleteResult = await collection.deleteOne({ name: 'John Doe' });
    //console.log('Delete Result:', deleteResult);
  } finally {
    // Close the connection
    await client.close();
    //console.log('Connection to MongoDB closed');
  }
}