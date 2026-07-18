const mongoose = require('mongoose');

// نخزّن حالة الاتصال في متغير عام لتفادي فتح اتصال جديد مع كل استدعاء
// Serverless Function على Vercel (Cold Start) - وإلا سينفد حد الاتصالات بسرعة
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState === 1;
    console.log(`✅ MongoDB متصلة بنجاح: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
    // على Vercel لا نستخدم process.exit لأنه يوقف الدالة السيرفرلس بشكل خاطئ
    if (process.env.VERCEL !== '1') process.exit(1);
    throw error;
  }
};

module.exports = connectDB;
