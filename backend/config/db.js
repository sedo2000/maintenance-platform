const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // خيارات الاتصال الحديثة لا تحتاج useNewUrlParser/useUnifiedTopology في mongoose 8+
    });
    console.log(`✅ MongoDB متصلة بنجاح: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
