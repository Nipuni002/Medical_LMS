# Admin Authentication System

## Admin Credentials
```
Email: thakshilaperera37@gmail.com
Password: AdminN123
```

## Authentication Endpoints

### Login (Public)
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "thakshilaperera37@gmail.com",
  "password": "AdminN123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "Admin User",
    "email": "thakshilaperera37@gmail.com",
    "role": "admin"
  }
}
```

### Register (Public)
**POST** `/api/auth/register`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

### Get Current User (Private)
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <token>
```

### Update Password (Private)
**PUT** `/api/auth/updatepassword`

Headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

### Admin Dashboard (Private/Admin Only)
**GET** `/api/auth/admin/dashboard`

Headers:
```
Authorization: Bearer <token>
```

## Testing the Admin Login

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"thakshilaperera37@gmail.com\",\"password\":\"AdminN123\"}"
```

### Using PowerShell:
```powershell
$body = @{
    email = "thakshilaperera37@gmail.com"
    password = "AdminN123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'

$response
```

### Using JavaScript/Fetch:
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'thakshilaperera37@gmail.com',
    password: 'AdminN123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login successful:', data);
  localStorage.setItem('token', data.token);
});
```

## Frontend Pages Created

### Admin Login Page
- **File**: `client/src/pages/AdminLogin.js`
- **Route**: `/admin/login`
- Features:
  - Email and password input
  - Error handling
  - Loading states
  - Auto-redirect on successful login

### Admin Dashboard Page
- **File**: `client/src/pages/AdminDashboard.js`
- **Route**: `/admin/dashboard`
- Features:
  - Protected route (requires authentication)
  - User statistics
  - Quick action buttons
  - Logout functionality

## Security Features

✅ **Password Hashing**: Passwords are hashed using bcrypt before storing
✅ **JWT Tokens**: Secure JSON Web Tokens for authentication
✅ **Protected Routes**: Middleware to verify authentication
✅ **Role-based Access**: Admin-only routes with authorization middleware
✅ **Token Expiration**: Tokens expire after 30 days

## File Structure

```
server/
├── middleware/
│   └── auth.js              # Authentication & authorization middleware
├── routes/
│   └── auth.js              # Authentication routes
├── models/
│   └── User.js              # Updated with password field & methods
├── seeds/
│   └── seedAdmin.js         # Script to create admin user
└── .env                     # JWT secret & configuration

client/src/pages/
├── AdminLogin.js            # Admin login page
├── AdminLogin.css          # Login page styles
├── AdminDashboard.js       # Admin dashboard
└── AdminDashboard.css      # Dashboard styles
```

## Next Steps

1. Add the admin routes to your React Router:
```javascript
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// In your routes
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
```

2. Access the admin login page:
```
http://localhost:3000/admin/login
```

3. Login with the credentials:
- Email: thakshilaperera37@gmail.com
- Password: AdminN123

## Creating Additional Admins

Run the seed script with different credentials:
```bash
cd server
node seeds/seedAdmin.js
```

Or use the register endpoint with role "admin":
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New Admin","email":"admin@example.com","password":"password123","role":"admin"}'
```
