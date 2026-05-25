const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
