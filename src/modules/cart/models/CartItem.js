import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1, min: 0 },
});

cartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

cartItemSchema.virtual('subtotal').get(function () {
  if (!this.product || typeof this.product.price !== 'number') return 0;
  return this.product.price * this.quantity;
});

cartItemSchema.set('toJSON', { virtuals: true });
cartItemSchema.set('toObject', { virtuals: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;