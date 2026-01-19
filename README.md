# Medical LMS - Enhance Medical Education

A full-stack medical education platform built with MongoDB, Express, React, and Node.js.

## Features

- **Modern UI Design**: Dark blue and white color scheme with responsive layout
- **React Frontend**: Component-based architecture with CSS styling
- **Express Backend**: RESTful API server
- **MongoDB Integration**: Database support (ready to configure)
- **Medical Subjects**: Browse and explore medical education content
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Project Structure

```
Health/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                # Express backend
│   ├── index.js
│   ├── .env
│   └── package.json
└── package.json           # Root package file

```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Setup Instructions

1. **Install dependencies**
   ```bash
   npm run server:install
   npm run client:install
   ```

2. **Configure Environment Variables**
   - Edit `server/.env` and add your MongoDB URI:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=5000
   ```

3. **Start the Application**
   ```bash
   npm start
   ```
   This will start both the server (port 5000) and client (port 3000) concurrently.

## Usage

- **Development Mode**: `npm run dev`
- **Start Server Only**: `npm run server`
- **Start Client Only**: `npm run client`

## Components

### Header
Navigation component with links to different sections

### Hero Section
Main banner with tagline and branding

### Quick Links
Exams and Subjects quick access cards

### Subjects Grid
Display of available medical subjects with color-coded cards

### Contact Section
Contact information area

### About Section
Information about the platform

### Footer
Footer with copyright and links

## Styling

- **Primary Color**: Dark Blue (#001f5c)
- **Secondary Color**: White (#fff)
- **Accent Colors**: Greens, purples, oranges for subject cards
- **Responsive**: Mobile-first design approach

## API Endpoints

- `GET /api/health` - Health check endpoint

(More endpoints to be added)

## Future Enhancements

- User authentication (login/signup)
- Exam creation and management
- Subject content management
- User progress tracking
- Quiz functionality
- Payment integration

## License

ISC

## Support

For support, email: support@enhancemedicaleducation.com
