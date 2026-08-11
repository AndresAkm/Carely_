import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, default: '' },
  icon: { type: String, required: true },
  image: { type: String, default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Category', categorySchema);
