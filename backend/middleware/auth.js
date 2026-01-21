import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    console.log(`[Auth Debug] Checking role: Required '${role}', User has '${req.user.role}'`);
    console.log(req.user)
    if (req.user.role !== role) {
      console.log('[Auth Debug] Permission denied');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

const requireSupport = requireRole('support');
const requireAdmin = requireRole('admin');

export { auth, requireRole, requireSupport, requireAdmin };