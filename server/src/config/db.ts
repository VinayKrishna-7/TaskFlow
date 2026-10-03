import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

let memoryServer: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
    
    // Attempt standard connection with 2 second timeout
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected successfully to: ${mongoUri}`);
      return;
    } catch (primaryErr) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Production MongoDB connection failed:', primaryErr);
        process.exit(1);
      }
      
      console.warn('⚠️  Local MongoDB unavailable. Initializing persistent embedded MongoDB database...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const dbDir = path.resolve(__dirname, '../../.data/db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      try {
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dbDir,
            storageEngine: 'wiredTiger',
          },
        });
        console.log(`✅ Persistent embedded MongoDB storage initialized at: ${dbDir}`);
      } catch (lockErr) {
        console.warn('⚠️  Persistent db lock issue, falling back to memory instance:', lockErr);
        memoryServer = await MongoMemoryServer.create();
      }

      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`✅ Connected to embedded MongoDB at: ${memUri}`);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};
