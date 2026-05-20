import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const indexes = await usersCollection.indexes();
    console.log('Current user indexes:', indexes.map(i => i.name));
    
    // Tìm index có chứa username
    const usernameIndex = indexes.find(i => i.name.includes('username'));
    
    if (usernameIndex) {
      await usersCollection.dropIndex(usernameIndex.name);
      console.log(`Đã xóa index cũ bị lỗi: ${usernameIndex.name}`);
    } else {
      console.log('Không tìm thấy index username. Có thể lỗi là do email.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
};

fixIndexes();
