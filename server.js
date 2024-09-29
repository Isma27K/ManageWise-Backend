// =================================== DEPENDENCY =====================================
const express = require('express');
const cors = require('cors');
const path = require('path');

//==================================== ROUTES =========================================
//const test = require('./routes/test/test');
const userAuth = require('./routes/auth/userAuth.js');
const DDdata = require('./routes/dashboard/DData.js');
const update = require('./routes/update/update.js');

// ===================================================================================

const app = express();

// Middleware to parse JSON requests and handle CORS
app.use(express.json());
app.use(cors());

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// =================================== WHERE API ROUTES START =====================================================

app.get('/', (req, res) => {
  res.jsonp({message: "Hello, from izz"});
});

//app.use("/test", test);

app.use('/auth', userAuth);

app.use('/api/data', DDdata);

app.use('/update', update);

// =================================== 404 Not Found Handler ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
