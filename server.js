// =================================== DEPENDENCY =====================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Mongob = require('./utils/mongodb/mongodb.js');
const multer = require('multer');
const authenticateToken = require('./middleware/jwtAuth.js');

//==================================== ROUTES =========================================
//const test = require('./routes/test/test');
const userAuth = require('./routes/auth/userAuth.js');
const DDdata = require('./routes/dashboard/DData.js');
const update = require('./routes/update/update.js');
const admin = require('./routes/admin/admin.js');
const task = require('./routes/task/task.js');
//====================================================================================

const app = express();

// Middleware to handle CORS
app.use(cors());

// Parse JSON bodies for all routes
app.use(express.json());

// Parse URL-encoded bodies for all routes
app.use(express.urlencoded({ extended: true }));

//====================================================================================

// Function to ensure upload directory exists
function ensureUploadDirExists() {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
  }
}

// Call the function to ensure the upload directory exists
ensureUploadDirExists();

// Serve static files for uploads
app.use('/uploads', authenticateToken, express.static(path.join(__dirname, '..', 'uploads')));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads')) // This will create an 'uploads' folder one level up from the backend folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// In your route setup
app.use('/api/task', upload.single('attachment'), require('./routes/task/task'));


// ===================================================================================

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

app.use('/auth', userAuth);                 // user authentication related routes
app.use('/api/data', DDdata);               // dashboard data related routes
app.use('/api/task', task);                 // task related routes
app.use('/update', update);                 // update related routes
app.use('/api/admin', admin);               // admin related routes
//app.use('/api/archive', archive);           // archive related routes


// =================================== 404 Not Found Handler ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
