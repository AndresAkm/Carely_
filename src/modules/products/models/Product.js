import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '' },
    slug: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    price: { type: Number, required: true },
    image: { type: String, default: null },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
