# ManageWise-Backend

This is the backend server for the ManageWise Project, a comprehensive task management system.

## Technologies

- Node.js
- Express.js
- MongoDB
- Firebase Authentication
- JWT (JSON Web Tokens)
- Nodemailer (for email functionality)
- Multer (for file uploads)
- Nodemon (for development)
- Jest (for testing)

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- MongoDB instance (local or cloud-based)
- Firebase project (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ismasalalu/ManageWise-Backend.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```bash
   PORT=5000
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_connection_string
   REACT_APP_API_KEY=your_firebase_api_key
   REACT_APP_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_DATABASE_URL=your_firebase_database_url
   REACT_APP_PROJECT_ID=your_firebase_project_id
   REACT_APP_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_APP_ID=your_firebase_app_id
   REACT_APP_MEASUREMENT_ID=your_firebase_measurement_id
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   ```

### Running the Server

- For development (with auto-restart):
  ```bash
  npm start
  ```

- For production:
  ```bash
  npm run prod
  ```

## API Routes

### Authentication

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login and receive a JWT
- `POST /auth/checkLink`: Check if a registration link is valid

### User Data

- `POST /api/data/DUdata`: Get user data (protected route)
- `POST /api/data/DDdata`: Get dashboard data (protected route)
- `POST /api/data/AllUserData`: Get all users data (protected route, admin only)
- `POST /api/data/archivePool`: Get archived pool data (protected route)

### User Updates

- `POST /update/username`: Update user's username (protected route)
- `POST /update/avatar`: Update user's avatar (protected route)

### Admin Routes

- `POST /api/admin/generate`: Generate a registration link (admin only)
- `POST /api/admin/CreatePool`: Create a new pool (admin only)
- `POST /api/admin/DeleteUser`: Delete a user (admin only)

### Task Management

- `POST /api/task/createTask`: Create a new task (protected route)
- `POST /api/task/updateProgress`: Update task progress (protected route)
- `POST /api/task/saveUpdateTask`: Update task details (protected route)

### Archive Management

- `POST /api/archive/archiveTask`: Archive a task (protected route)
- `POST /api/archive/unarchiveTask`: Unarchive a task (protected route)

## Database Structure

- Database: `ManageWise`
- Collections:
  - `users`: User information
  - `pools`: Pool information
  - `regId`: Registration IDs

## Authentication Flow

1. User registers or logs in through Firebase Authentication
2. Backend validates the Firebase token and issues a JWT
3. JWT is used for subsequent authenticated requests

## Middleware

- `jwtAuth.js`: Authenticates requests using JWT
- CORS handling for cross-origin requests

## File Uploads

- Multer is used for handling file uploads
- Uploaded files are stored in the `uploads` directory

## Error Handling

- Custom error responses for various scenarios (401, 403, 404, etc.)

## Testing

Run tests using:
```bash
npm test
```
