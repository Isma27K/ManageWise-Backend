//========== get all the dependencies ===============
const verifyToken = require("./firebase/verifyAccToken");
const cors = require('cors');
const express = require('express');
const app = express();

// Middlewares
app.use(cors()); // Allow cross-origin requests (e.g., from React)
app.use(express.json()); // Parse incoming JSON requests (replaces bodyParser.json())

// If you need to parse URL-encoded data, add this:
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 2727;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
    res.json({Alert: {message: "Get Aways From Here Monkeys", From: "IZZ"}});
});

// GET route
app.get('/api/data', (req, res) => {
    res.json({ message: 'This is some data from the server!' });
});

// POST route
app.post('/api/data', (req, res) => {
  const newData = req.body;
  console.log('Received data:', newData);
  res.status(201).json({ message: 'Data received successfully!', data: newData });
});

// Example route that requires authentication
app.post('/protected-route', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }
  
    try {
      const decodedToken = await verifyToken(token);
      console.log('User ID:', decodedToken.uid);
      // Continue with your logic, using decodedToken
      res.status(200).json({ message: 'Authenticated successfully' });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized access' });
    }
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}`);
});