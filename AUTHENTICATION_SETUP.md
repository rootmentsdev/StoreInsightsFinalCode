# Authentication Setup Instructions

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory with:
   ```
   MONGODB=mongodb+srv://abhirambca2021_db_user:root@cluster0.ndqmb8j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   FRONTEND_ORIGINS=http://localhost:5173
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Install Dependencies** (if not already done)
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## Features Implemented

### Backend
- ✅ MongoDB connection with Mongoose
- ✅ User model with password hashing
- ✅ JWT authentication middleware
- ✅ Registration endpoint (`POST /api/auth/register`)
- ✅ Login endpoint (`POST /api/auth/login`)
- ✅ User profile endpoint (`GET /api/auth/me`)
- ✅ Logout endpoint (`POST /api/auth/logout`)

### Frontend
- ✅ Beautiful Login page with glassmorphic design
- ✅ Beautiful Register page with validation
- ✅ Real API integration
- ✅ Form validation and error handling
- ✅ Loading states and user feedback
- ✅ Navigation between login and register pages

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)
- `POST /api/auth/logout` - Logout user

## Security Features

- Password hashing with bcryptjs
- JWT tokens for authentication
- Input validation and sanitization
- CORS protection
- Rate limiting
- Password strength requirements
