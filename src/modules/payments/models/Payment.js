import mongoose from 'mongoose';

const PAYMENT_METHODS = ['tarjeta', 'transferencia', 'efectivo'];
const PAYMENT_STATUS = ['pendiente', 'completado', 'fallido', 'reembolsado'];

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    status: { type: String, enum: PAYMENT_STATUS, default: 'pendiente' },
    transactionId: { type: String, default: '', maxlength: 255 },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;