# Todo App API

A secure Node.js REST API for managing todos with JWT authentication. Built with Express, MongoDB, and Mongoose.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with JSON Web Tokens
- 📝 **CRUD Operations** - Full Create, Read, Update, Delete functionality for todos
- 🔒 **Security Features**:
  - Password hashing with Argon2
  - Rate limiting (general and strict for auth endpoints)
  - Helmet security headers
  - CORS configuration
  - Request body size limits
- 🛡️ **Error Handling** - Comprehensive error handling with proper error messages
- 📊 **Advanced Features**:
  - Pagination
  - Filtering
  - Sorting
  - Field limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd starter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your settings:
```env
MONGO_URI=mongodb://localhost:27017/todos-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=90d
PORT=8000
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a strong, random value in production!

5. Start the server:
```bash
npm start
```

The server will start on `http://localhost:8000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication Endpoints

All authentication endpoints are prefixed with `/api/v1/users`

#### Sign Up
```http
POST /api/v1/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Logout
```http
POST /api/v1/users/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success"
}
```

### Todo Endpoints

All todo endpoints are prefixed with `/api/v1/todos` and require authentication.

#### Get All Todos
```http
GET /api/v1/todos
Authorization: Bearer <token>
```

**Query Parameters:**
- `sort` - Sort by field(s) (e.g., `-createdAt`, `title,priority`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 100)
- `fields` - Select specific fields (e.g., `title,completed`)
- Filtering: Use MongoDB operators (e.g., `?completed=true&priority[gte]=2`)

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "todos": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Complete project",
        "description": "Finish the todo app",
        "completed": false,
        "priority": 1,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "userId": "507f1f77bcf86cd799439010"
      }
    ]
  }
}
```

#### Create Todo
```http
POST /api/v1/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the todo app",
  "priority": 1
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project",
      "description": "Finish the todo app",
      "completed": false,
      "priority": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "userId": "507f1f77bcf86cd799439010"
    }
  }
}
```

#### Get Single Todo
```http
GET /api/v1/todos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project",
      "description": "Finish the todo app",
      "completed": false,
      "priority": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "userId": "507f1f77bcf86cd799439010"
    }
  }
}
```

#### Update Todo
```http
PATCH /api/v1/todos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "priority": 2
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project",
      "description": "Finish the todo app",
      "completed": true,
      "priority": 2,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "userId": "507f1f77bcf86cd799439010"
    }
  }
}
```

#### Delete Todo
```http
DELETE /api/v1/todos/:id
Authorization: Bearer <token>
```

**Response:**
```
Status: 204 No Content
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | Yes | - |
| `PORT` | Server port | No | 8000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `CORS_ORIGIN` | Allowed CORS origin | No | * |

## Security Features

### Rate Limiting
- **General routes**: 100 requests per 15 minutes per IP
- **Auth routes** (login/signup): 5 requests per 15 minutes per IP

### Password Requirements
- Minimum 8 characters
- Automatically hashed with Argon2

### Authentication
- JWT tokens required for protected routes
- Tokens sent in `Authorization` header: `Bearer <token>`

## Error Handling

The API uses standardized error responses:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Project Structure

```
starter/
├── app.js                 # Main application file
├── package.json
├── .env.example          # Environment variables template
├── controllers/          # Route controllers
│   ├── todoController.js
│   └── user.controller.js
├── middleware/           # Express middleware
│   ├── auth.middleware.js
│   ├── errorHandler.js
│   └── todo.middleware.js
├── routes/               # API routes
│   ├── todoRoute.js
│   └── user.route.js
├── schemas/              # Mongoose schemas
│   ├── todo.schema.js
│   └── user.schema.js
└── utils/                # Utility functions
    ├── ApiFeatures.js
    ├── catchAsync.js
    └── envValidator.js
```

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **argon2** - Password hashing
- **helmet** - Security headers
- **cors** - CORS configuration
- **express-rate-limit** - Rate limiting
- **validator** - Input validation

## Deployment

This API is ready for production deployment. For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy Options

#### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Sign up at [Render](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Add environment variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Strong random secret (32+ characters)
   - `JWT_EXPIRES_IN` - Token expiration (e.g., `90d`)
   - `NODE_ENV` - `production`
   - `CORS_ORIGIN` - Your frontend URL
6. Set build command: `npm install`
7. Set start command: `npm start`
8. Deploy!

#### Deploy to Railway

1. Push your code to GitHub
2. Sign up at [Railway](https://railway.app)
3. Create a new project from GitHub
4. Add environment variables (same as Render above)
5. Railway auto-detects Node.js and deploys automatically

### Production Environment Variables

Required for production:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-strong-random-secret-32-plus-characters-long
JWT_EXPIRES_IN=90d
NODE_ENV=production
CORS_ORIGIN=https://yourfrontend.com
PORT=8000
```

**Important Production Notes:**
- ⚠️ Never commit `.env` files (already in `.gitignore`)
- ✅ Use MongoDB Atlas for production database
- ✅ Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- ✅ Set specific CORS_ORIGIN (not wildcard `*`)
- ✅ Enable MongoDB Atlas IP whitelisting

For complete step-by-step deployment guide including MongoDB Atlas setup, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## License

ISC

## Author

Mahmoud Adel

