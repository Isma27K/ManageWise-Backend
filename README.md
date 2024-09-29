# ManageWise-Backend

This is the backend server for the ManageWise Project, a comprehensive task management system.

## Technologies

- Node.js
- Express.js
- MongoDB
- Firebase Authentication
- JWT (JSON Web Tokens)
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
   MONGODB_URI=your_mongodb_connection_string
   FIREBASE_CONFIG=your_firebase_config_json
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

### User Data

- `POST /api/data/DUdata`: Get user data (protected route)
- `POST /api/data/DDdata`: Get dashboard data (protected route)

### User Updates

- `POST /update/username`: Update user's username (protected route)

## Database Structure

- Database: `ManageWise`
- Collections:
  - `users`: User information
  - `tasks`: Task information (to be implemented)

## Authentication Flow

1. User registers or logs in through Firebase Authentication
2. Backend validates the Firebase token and issues a JWT
3. JWT is used for subsequent authenticated requests

## Middleware

- `jwtAuth.js`: Authenticates requests using JWT
- CORS handling for cross-origin requests

## Error Handling

- Custom error responses for various scenarios (401, 403, 404, etc.)

## Testing

Run tests using:
```bash
npm test
```

