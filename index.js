// index.js
const server = require('./server');

// Set the port the app will listen on
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
