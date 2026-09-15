import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socketManager';
import { User } from './models/User';
import { seedDatabase } from './utils/seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demo data if database has no users (e.g. fresh memory server or clean DB)
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 No users found in database. Automatically seeding demo accounts & workspace...');
        await seedDatabase(false);
      }
    } catch (seedErr) {
      console.warn('⚠️  Auto-seed check encountered an issue (continuing server startup):', seedErr);
    }

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 TaskFlow API Server running on port ${PORT}`);
      console.log(`📚 Swagger documentation available at: http://localhost:${PORT}/api-docs`);
      console.log(`🩺 Health check endpoint at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();