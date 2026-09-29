import jwt from 'jsonwebtoken';
import config from './config.js';
import User from './models/userModel.js';

export const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    config.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

export const isAuth = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) return res.status(401).send({ message: 'No token provided' });
    const token = bearerToken.slice(7);

    jwt.verify(token, config.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid or expired token' });
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (err) {
    return res.status(500).send({ message: 'Server error' });
  }
};

export const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user._id) return res.status(401).send({ message: 'Unauthorized' });
  const user = await User.findById(req.user._id);
  if (!user || !user.isAdmin) return res.status(403).send({ message: 'Admins only' });
  next();
};
