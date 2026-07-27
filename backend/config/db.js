import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance using Mongoose ORM
 */
const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    if (!dbUri) {
      console.error('[Database Error] MONGO_URI environment variable is missing!');
    }
    const conn = await mongoose.connect(dbUri || 'mongodb://127.0.0.1:27017/spendwise_db', {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
