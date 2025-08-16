


// middleware/auth.js
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import User from '../models/users.js';
import { env } from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    // 1) Get token from header/cookie
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not logged in!', 401);
    }

    // 2) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AppError('User no longer exists', 401);
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new AppError('Password changed! Please log in again', 401);
    }
// console.log("user",currentUser);

    // Grant access
    req.user = {...currentUser,token};
    next();
  } catch (err) {
    next(err);
  }
};

// middleware/auth.js
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('Unauthorized action', 403);
    }
    next();
  };
};

// Usage in routes:
// router.get('/admin-route', protect, restrictTo('admin'), adminController);