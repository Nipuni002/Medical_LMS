# Medical LMS Backend API

## Overview
Backend server for the Medical Learning Management System, connected to MongoDB database `medical_db`.

## Database Connection
- **Database Name**: medical_db
- **Connection Status**: ✅ Connected Successfully

## Environment Variables
The `.env` file contains:
```
PORT=5000
MONGODB_URI=mongodb+srv://Admin:ABC123@cluster0.2ndv7.mongodb.net/medical_db?appName=Cluster0
JWT_SECRET=change_this_jwt_secret
JWT_EXPIRE=30d

# SMTP config for login confirmation emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password
EMAIL_FROM=Medical LMS <your_email@example.com>
APP_NAME=Medical LMS
```

## Installation
```bash
cd server
npm install
```

## Running the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Check server and database status

### Users
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
  ```
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### Courses
- **GET** `/api/courses` - Get all courses
- **GET** `/api/courses/:id` - Get course by ID
- **POST** `/api/courses` - Create new course
  ```json
  {
    "title": "PLAB 1 Preparation",
    "description": "Complete PLAB 1 exam preparation course",
    "category": "PLAB",
    "instructor": "user_id_here",
    "duration": "3 months",
    "level": "Intermediate"
  }
  ```
- **PUT** `/api/courses/:id` - Update course
- **DELETE** `/api/courses/:id` - Delete course
- **POST** `/api/courses/:id/enroll` - Enroll student in course
  ```json
  {
    "studentId": "student_user_id_here"
  }
  ```

## Database Models

### User Model
- name (String, required)
- email (String, required, unique)
- role (enum: 'student', 'instructor', 'admin')
- enrolledCourses (Array of Course IDs)
- createdAt (Date)

### Course Model
- title (String, required)
- description (String, required)
- category (enum: 'PLAB', 'USMLE', 'Medical Subjects', 'Clinical Skills')
- instructor (User ID reference)
- duration (String, required)
- level (enum: 'Beginner', 'Intermediate', 'Advanced')
- isPublished (Boolean)
- enrolledStudents (Array of User IDs)
- createdAt (Date)
- updatedAt (Date)

## Testing the API
You can test the API using tools like:
- Postman
- Thunder Client (VS Code Extension)
- cURL
- Fetch API from the frontend

Example cURL request:
```bash
curl http://localhost:5000/api/health
```

## Server Structure
```
server/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js           # User model
│   └── Course.js         # Course model
├── routes/
│   ├── users.js          # User routes
│   └── courses.js        # Course routes
├── .env                  # Environment variables
├── index.js              # Main server file
├── package.json          # Dependencies
└── testConnection.js     # Connection test script
```
