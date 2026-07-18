const jwt = require('jsonwebtoken');
const User = require('../models/User');

// التحقق من وجود توكن صالح
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'المستخدم غير موجود' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'التوكن غير صالح أو منتهي الصلاحية' });
    }
  }

  return res.status(401).json({ message: 'غير مصرح - لا يوجد توكن' });
};

// السماح فقط لدور معين (مثلاً provider)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليست لديك صلاحية القيام بهذا الإجراء' });
    }
    next();
  };
};

module.exports = { protect, authorize };
