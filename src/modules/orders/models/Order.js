import mongoose from 'mongoose';

const ORDER_STATUS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ORDER_STATUS, default: 'pendiente' },
    total: { type: Number, default: 0 },
    shippingAddress: { type: String, default: '' },
    notes: { type: String, default: '' },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    couponCode: { type: String, default: '', maxlength: 50 },
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;