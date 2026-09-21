import mongoose from 'mongoose';

const ORDER_STATUS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

const orderStatusHistorySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    status: { type: String, enum: ORDER_STATUS, required: true },
    comment: { type: String, default: '' },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const OrderStatusHistory = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);

export default OrderStatusHistory;