import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 3000,
  MONGODB_URL: process.env.MONGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  BASE_URL: process.env.BASE_URL,

};
