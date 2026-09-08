import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, maxlength: 150 },
    lastName: { type: String, default: '', maxlength: 150 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: { type: String, default: '', maxlength: 20 },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
