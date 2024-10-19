// =================================== DEPENDENCY =====================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Mongob = require('./utils/mongodb/mongodb.js');
const multer = require('multer');
const authenticateToken = require('./middleware/jwtAuth.js');
const bodyParser = require('body-parser');

//==================================== ROUTES =========================================
//const test = require('./routes/test/test');
const archive = require('./routes/archive/archive.js');
const userAuth = require('./routes/auth/userAuth.js');
const DDdata = require('./routes/dashboard/DData.js');
const update = require('./routes/update/update.js');
const admin = require('./routes/admin/admin.js');
const task = require('./routes/task/task.js');
const report = require('./routes/report/report.js');
//============================= File Uploads middleware ========================================

const app = express();

// Increase the limit for JSON payloads
app.use(bodyParser.json({limit: '50mb'}));
// Increase the limit for URL-encoded payloads
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Middleware to handle CORS
app.use(cors());

// Parse JSON bodies for all routes
app.use(express.json());

// Parse URL-encoded bodies for all routes
app.use(express.urlencoded({ extended: true }));

//================================== Serve File Uploads ========================================

// Function to ensure upload directory exists
function ensureUploadDirExists() {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
  }
}

ensureUploadDirExists();

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// =================================== WHERE API ROUTES START =====================================================

app.get('/', (req, res) => {
  res.jsonp({message: "Hello, from izzma llagi. haloooo"});
});

//app.use("/test", test);

app.use('/auth', userAuth);                 // user authentication related routes
app.use('/api/data', DDdata);               // dashboard data related routes
app.use('/api/task', task);                 // task related routes
app.use('/update', update);                 // update related routes
app.use('/api/admin', admin);               // admin related routes
app.use('/api/archive', archive);           // archive related routes

//                           ------------------

app.use('/api/report', report);


// =================================== 404 Not Found Handler ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

module.exports = app;

// mun nampak, maksudnya okeyyy oooo