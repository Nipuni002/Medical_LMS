# Quick Start Guide

## Getting Started with Enhance Medical Education

### Prerequisites
- Node.js installed
- MongoDB running (local or Atlas URI configured)

### Step 1: Navigate to Project Directory
```bash
cd "c:\Users\ASUS\OneDrive\Documents\Health"
```

### Step 2: Start the Application
```bash
npm start
```

This will:
- Start the Express server on `http://localhost:5000`
- Start the React client on `http://localhost:3000`

### Step 3: Open in Browser
- Navigate to `http://localhost:3000` to view the home page

## Project Features

✅ **Dark Blue & White Theme** - Professional medical education design
✅ **Responsive Layout** - Works on all device sizes
✅ **Hero Section** - Eye-catching banner with brand message
✅ **Quick Links** - Easy access to Exams and Subjects
✅ **Subject Cards** - Color-coded medical subjects
✅ **Contact Section** - Contact information area
✅ **About Section** - Platform information
✅ **Professional Navigation** - Header with quick links

## File Structure

```
Health/
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Header.js/css
│       │   ├── HeroSection.js/css
│       │   ├── QuickLinks.js/css
│       │   ├── SubjectsGrid.js/css
│       │   ├── ContactSection.js/css
│       │   ├── AboutSection.js/css
│       │   └── Footer.js/css
│       ├── pages/
│       │   └── Home.js/css
│       ├── App.js/css
│       └── index.js/css
└── server/
    ├── index.js
    └── .env

```

## Color Scheme

- **Primary**: Dark Blue (#001f5c)
- **Secondary**: White (#fff)
- **Accents**: 
  - Green (#1b5e20, #4caf50)
  - Purple (#9c27b0)
  - Orange (#ff9800, #ff6f00)
  - Cyan (#0288d1)

## Next Steps

1. **Add Database Connection** - Update MongoDB URI in `server/.env`
2. **Create API Routes** - Add endpoints in `server/index.js`
3. **Create Models** - Add MongoDB schemas for exams and subjects
4. **Add Authentication** - Implement user login/signup
5. **Build Admin Panel** - Create exam and content management

## Development Commands

- **Start Both**: `npm start`
- **Server Only**: `npm run server`
- **Client Only**: `npm run client`
- **Development Mode**: `npm run dev`

## Environment Variables

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

## Troubleshooting

- If port 3000 is already in use, the React app will use the next available port
- Make sure MongoDB is running if you're using a local instance
- Clear browser cache if styles don't load correctly

## Support

For issues or questions, check the README.md file for more information.
