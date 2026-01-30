import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import scansRouter from './routes/scans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });

// Routes
app.use('/api', scansRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vivitsu Medical AI Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      getAllScans: 'GET /api/scans',
      getScanById: 'GET /api/scans/:id',
      createScan: 'POST /api/scans',
      deleteScan: 'DELETE /api/scans/:id'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
