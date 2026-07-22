const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware — CORS
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL, // Vercel frontend URL (set in Railway env variables)
].filter(Boolean); // remove undefined if CLIENT_URL is not set

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    database: 'MongoDB Connected'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/plab-content', require('./routes/plabContent'));
app.use('/api/plab-tests', require('./routes/plabTests'));
app.use('/api/plab-theory-subjects', require('./routes/plabTheorySubjects'));
app.use('/api/plab-theory-content', require('./routes/plabTheoryContent'));
app.use('/api/usmle-subjects', require('./routes/usmleSubjects'));
app.use('/api/usmle-theory-content', require('./routes/usmleTheoryContent'));
app.use('/api/usmle-introduction-content', require('./routes/usmleIntroductionContent'));
app.use('/api/amc-subjects', require('./routes/amcSubjects'));
app.use('/api/amc-theory-content', require('./routes/amcTheoryContent'));
app.use('/api/next-subjects', require('./routes/nextSubjects'));
app.use('/api/next-theory-content', require('./routes/nextTheoryContent'));
app.use('/api/about-content', require('./routes/aboutContent'));
app.use('/api/contact-content', require('./routes/contactContent'));
app.use('/api/legal-content', require('./routes/legalContent'));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
