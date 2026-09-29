import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { generateToken, generateRefreshToken, isAuth } from '../utils.js';
import { generateOTP, sendOTPEmail } from '../OTPservice.js';
import NodeCache from 'node-cache';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import config from '../config.js';
import validator from 'validator';
import mongoose from 'mongoose';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Too many failed login attempts. Please try again in 15 minutes.',
  },
  headers: true,
  keyGenerator: (req) => req.body.email,
  standardHeaders: true,
  legacyHeaders: false,
});

const cache = new NodeCache({ stdTTL: 300 });
const userRouter = express.Router();

// ===== CSRF Protection =====
const csrfProtection = (req, res, next) => {
  // Generate a CSRF token for GET requests
  if (req.method === 'GET') {
    let csrfToken = req.cookies['XSRF-TOKEN'];

    if (!csrfToken) {
      csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });
    }

    req.csrfToken = () => csrfToken;

    return next();
  }

  const csrfToken = req.headers['x-csrf-token'];
  const csrfCookie = req.cookies['XSRF-TOKEN'];

  if (!csrfToken || !csrfCookie) {
    return res.status(403).json({
      message: 'Invalid CSRF Token',
    });
  }

  if (
    typeof csrfToken !== 'string' ||
    typeof csrfCookie !== 'string' ||
    csrfToken.length !== csrfCookie.length ||
    !crypto.timingSafeEqual(
      Buffer.from(csrfToken),
      Buffer.from(csrfCookie)
    )
  ) {
    return res.status(403).json({
      message: 'Invalid CSRF Token',
    });
  }

  next();
};

// ===== Create Admin User =====
userRouter.get(
  '/createadmin',
  expressAsyncHandler(async (req, res) => {
    try {
      const user = new User({
        name: 'ahmed',
        email: 'ahmed@example.com',
        password: bcrypt.hashSync('aaabbb', 8),
        isAdmin: true,
      });

      const createdUser = await user.save();
      res.send(createdUser);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  })
);

// ===== CSRF Token =====
userRouter.get('/csrf-token', csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken();

  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });

  res.json({ csrfToken });
});

// ===== Signin =====
userRouter.post(
  '/signin',
  csrfProtection,
  loginLimiter,
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const csrfToken = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      return res.status(403).send({ message: 'Invalid CSRF' });
    }

    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the latest refresh token in DB
    user.refreshTokens = [refreshToken];
    await user.save();

    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: accessToken,
      refreshToken,
    });
  })
);

// ===== Refresh Token =====
userRouter.post(
  '/refresh-token',
  expressAsyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).send({
        message: 'Refresh token required',
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        config.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decoded._id);

      if (!user) {
        return res.status(404).send({
          message: 'User not found',
        });
      }

      if (!user.refreshTokens.includes(refreshToken)) {
        return res.status(403).send({
          message: 'Invalid refresh token',
        });
      }

      const newAccessToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Replace the old refresh token with the new one
      user.refreshTokens = [newRefreshToken];
      await user.save();

      res.send({
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } catch (err) {
      return res.status(403).send({
        message: 'Invalid or expired refresh token',
      });
    }
  })
);

// ===== Register =====
userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
    ];

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !validator.isEmail(email) ||
      name.includes('$') ||
      email.includes('$') ||
      password.includes('$')
    ) {
      return res.status(400).send({
        message: 'Invalid input format',
      });
    }

    const emailDomain = email.split('@')[1];

    if (!allowedDomains.includes(emailDomain)) {
      return res.status(400).send({
        message:
          'Please use a valid email from Gmail, Yahoo, Hotmail, Outlook, or iCloud.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        message:
          'If this email is eligible, you will receive further instructions shortly.',
      });
    }

    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).send({
        message: 'Password must be at least 8 characters long.',
      });
    }

    const verificationCode = generateOTP();

    const userId = new mongoose.Types.ObjectId().toString();

    cache.set(
      userId,
      {
        name,
        email,
        passwordPlain: password,
        verificationCode,
        isVerified: false,
        attempts: 0,
      },
      900
    );

    await sendOTPEmail(email, verificationCode);

    res.send({
      _id: userId,
      message: 'Verification code has been sent to your email.',
    });
  })
);

// ===== Verify OTP =====
userRouter.post(
  '/verify-code',
  expressAsyncHandler(async (req, res) => {
    const { _id, verificationCode } = req.body;

    const tempUser = cache.get(_id);

    if (!tempUser) {
      return res.status(404).send({
        message: 'User not found in cache',
      });
    }

    if (tempUser.attempts >= 5) {
      cache.del(_id);

      return res.status(429).send({
        message: 'Too many failed attempts. Try again later.',
      });
    }

    if (tempUser.verificationCode === verificationCode) {
      const hashedPassword = await bcrypt.hash(
        tempUser.passwordPlain,
        10
      );

      const user = new User({
        name: tempUser.name,
        email: tempUser.email,
        password: hashedPassword,
        isVerified: true,
      });

      const createdUser = await user.save();

      cache.del(_id);

      return res.send({
        user: {
          _id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          isAdmin: createdUser.isAdmin,
          token: generateToken(createdUser),
        },
        message: 'Verification successful and user registered',
      });
    }

    tempUser.attempts = (tempUser.attempts || 0) + 1;

    cache.set(_id, tempUser, 300);

    return res.status(400).send({
      message: 'Invalid verification code',
    });
  })
);

// ===== Update User =====
userRouter.put(
  '/:id',
  isAuth,
  csrfProtection,
  expressAsyncHandler(async (req, res) => {
    const csrfToken = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      return res.status(403).json({
        message: 'Invalid CSRF Token',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({
        message: 'User Not Found',
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser),
    });
  })
);

// ===== Forgot Password =====
userRouter.post(
  '/forgot-password',
  async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.send({
          status: 'User not existed',
        });
      }

      const token = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: '1d' }
      );

      user.resetPasswordToken = token;
      user.resetPasswordTokenUsed = false;

      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Password',
        text: `https://localhost:8080/#/reset-password/${user._id}/${token}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);

          return res.status(500).send({
            status: 'Error sending email',
          });
        }

        return res.send({
          status: 'Success',
          message: 'Email sent successfully',
        });
      });
    } catch (err) {
      res.status(500).send({
        status: 'Error',
        message: err.message,
      });
    }
  }
);

// ===== Reset Password =====
userRouter.post(
  '/reset-password/:id/:token',
  csrfProtection,
  async (req, res) => {
    const csrfToken = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      return res.status(403).json({
        message: 'Invalid CSRF Token',
      });
    }

    const { id, token } = req.params;
    const { password } = req.body;

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);

      if (!decoded) {
        return res.status(400).send({
          message: 'The link is invalid or expired',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
          message: 'Invalid user ID',
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).send({
          message: 'User not found',
        });
      }

      if (user.resetPasswordTokenUsed) {
        return res.status(400).send({
          message: 'This link has already been used',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.resetPasswordTokenUsed = true;

      await user.save();

      res.send({
        status: 'Success',
        message:
          'Password reset successfully. Please log in with your new password.',
      });
    } catch (err) {
      res.status(400).send({
        status: 'Error',
        message: 'The link is invalid or expired',
      });
    }
  }
);

export default userRouter;

