# 🔐 Admin Login - Quick Start Guide

## ✅ Admin Login Credentials

```
Email:    thakshilaperera37@gmail.com
Password: AdminN123
```

## 🌐 Access URLs

### Frontend
- **Admin Login Page**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

### Backend API
- **Login Endpoint**: http://localhost:5000/api/auth/login
- **Dashboard API**: http://localhost:5000/api/auth/admin/dashboard

## 🚀 How to Access Admin Panel

1. **Start the servers** (if not already running):
   ```bash
   # Terminal 1 - Backend Server
   cd server
   npm start

   # Terminal 2 - Frontend Client
   cd client
   npm start
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:3000/admin/login
   ```

3. **Login with credentials**:
   - Email: thakshilaperera37@gmail.com
   - Password: AdminN123

4. **You'll be redirected** to the Admin Dashboard automatically

## 📊 What's Included

### Backend Features ✅
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Role-based access control (Admin, Instructor, Student)
- RESTful API endpoints

### Frontend Features ✅
- Beautiful admin login page with gradient design
- Admin dashboard with statistics
- User information display
- Logout functionality
- Responsive design for mobile/tablet

### Security Features ✅
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 30-day expiration
- Protected routes requiring authentication
- Admin-only access control
- Secure token storage in localStorage

## 🧪 Testing Admin Login

### Test via Browser
1. Navigate to: http://localhost:3000/admin/login
2. Enter credentials
3. Click "Login"
4. View admin dashboard

### Test via API (PowerShell)
```powershell
$body = @{
    email = "thakshilaperera37@gmail.com"
    password = "AdminN123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $body -ContentType 'application/json'
```

### Test via API (cURL)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"thakshilaperera37@gmail.com","password":"AdminN123"}'
```

## 📁 Files Created

### Backend
- `server/models/User.js` - Updated with password field & bcrypt
- `server/routes/auth.js` - Authentication routes (login, register, etc.)
- `server/middleware/auth.js` - JWT verification & role authorization
- `server/seeds/seedAdmin.js` - Script to create admin user
- `server/.env` - Updated with JWT_SECRET
- `server/ADMIN_AUTH.md` - Complete authentication documentation

### Frontend
- `client/src/pages/AdminLogin.js` - Admin login page component
- `client/src/pages/AdminLogin.css` - Login page styling
- `client/src/pages/AdminDashboard.js` - Admin dashboard component
- `client/src/pages/AdminDashboard.css` - Dashboard styling
- `client/src/App.js` - Updated with admin routes

## 🔑 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login user (all roles) |
| POST | `/api/auth/register` | Public | Register new user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/updatepassword` | Private | Update password |
| GET | `/api/auth/admin/dashboard` | Admin Only | Admin dashboard access |

## 🎨 Design Features

- Modern gradient design (Purple/Blue theme)
- Smooth animations and transitions
- Responsive for all screen sizes
- Clean and professional UI
- Loading states and error handling
- Security-focused UX

## 📝 Notes

- Admin user is already created in the database
- JWT tokens are stored in localStorage
- Tokens expire after 30 days
- All passwords are securely hashed
- Admin role has access to all features

## 🛡️ Security Best Practices

✅ Never commit `.env` file to Git
✅ Use strong JWT_SECRET in production
✅ Implement HTTPS in production
✅ Add rate limiting for login attempts
✅ Implement session timeout on frontend
✅ Add CORS configuration for production

---

**System Status**: ✅ Ready to Use
**Admin User**: ✅ Created
**Backend**: ✅ Running on port 5000
**Frontend**: ✅ Running on port 3000
