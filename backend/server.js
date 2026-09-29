
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import config from './config.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';
import productRouter from './routers/productRouter.js';
import imageRouter from './routers/imageRouter.js';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

// ===== MongoDB Connection =====
mongoose
  .connect(config.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB.'))
  .catch((error) => console.log('MongoDB connection error:', error));

const app = express();

// ===== Security =====



// ===== CORS =====
const allowedOrigins = [
  'https://project-sell.fly.dev',
  'http://localhost:8080',
  'http://localhost:5000',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://unpkg.com',
  'https://www.paypal.com',
  'https://www.paypalobjects.com',
  'https://checkout.paypal.com',
  'https://c.paypal.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'x-xsrf-token',
    ],
  })
);

// Express 5 wildcard syntax
app.options('/{*splat}', cors());

// ===== Body Parsing =====
app.use(express.json());
app.use(cookieParser());

// ===== Helmet =====
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
          'https://fonts.googleapis.com',
        ],

        fontSrc: [
          "'self'",
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
          'https://fonts.gstatic.com',
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://www.paypal.com',
          'https://www.sandbox.paypal.com',
          'https://www.paypalobjects.com',
          'https://js.braintreegateway.com',
          'https://c.paypal.com',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
          'https://unpkg.com',
        ],

        connectSrc: [
          "'self'",
          'https://www.paypal.com',
          'https://api.paypal.com',
          'https://api.sandbox.paypal.com',
          'https://c.paypal.com',
          'https://www.sandbox.paypal.com',
        ],

        imgSrc: [
          "'self'",
          'data:',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
          'https://unpkg.com',
          'https://www.paypalobjects.com',
        ],

        frameSrc: [
          "'self'",
          'https://www.paypal.com',
          'https://checkout.paypal.com',
          'https://www.sandbox.paypal.com',
        ],

        childSrc: [
          "'self'",
          'https://www.paypal.com',
          'https://checkout.paypal.com',
          'https://www.sandbox.paypal.com',
        ],
      },
    },

    frameguard: false,
  })
);

// ===== Rate Limiting =====
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ===== Routers =====
app.use('/api/images', imageRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// ===== PayPal Client ID =====
app.get('/api/paypal/clientId', (req, res) => {
  res.send({
    clientId: config.PAYPAL_CLIENT_ID,
    env: 'sandbox',
  });
});

// ===== Static Files =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend')));

// ===== Catch-All Route =====
// Express 5 wildcard syntax
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((err, req, res, next) => {
   console.error('===== BACKEND ERROR =====');
    console.error('Method:', req.method); 
    console.error('URL:', req.originalUrl); 
    console.error('Error name:', err.name);
     console.error('Error message:', err.message);
      console.error('Stack:', err.stack);
       console.error('=========================');
        const status = err.name === 'ValidationError'  ? 400 : 500;
          res.status(status).send({ message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, }); });

// ===== Start Server =====
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

