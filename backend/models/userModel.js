// userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordTokenUsed: { type: Boolean, default: false },
  isAdmin: { type: Boolean, required: true, default: false },
  isVerified: { type: Boolean, default: false },
  refreshTokens: [{ type: String }],
});

const User = mongoose.model('User', userSchema);
export default User;
