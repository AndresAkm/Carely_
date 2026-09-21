import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0.01 },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    usageLimit: { type: Number, default: null, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    minimumPurchase: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

couponSchema.methods.isUsable = function (subtotal) {
  if (!this.isActive) return { valid: false, reason: 'El cupón no está activo.' };

  const now = new Date();
  if (this.validFrom && now < this.validFrom) {
    return { valid: false, reason: 'El cupón todavía no ha comenzado su vigencia.' };
  }
  if (this.validUntil && now > this.validUntil) {
    return { valid: false, reason: 'El cupón ha expirado.' };
  }
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: 'El cupón ha alcanzado su límite de usos.' };
  }
  if (subtotal < this.minimumPurchase) {
    return {
      valid: false,
      reason: `El subtotal mínimo para usar este cupón es COP ${Number(this.minimumPurchase).toLocaleString('es-CO', { minimumFractionDigits: 2 })}.`,
    };
  }
  if (this.discountType === 'percentage' && (this.discountValue <= 0 || this.discountValue > 100)) {
    return { valid: false, reason: 'El porcentaje del cupón es inválido.' };
  }
  if (this.discountType === 'fixed' && this.discountValue <= 0) {
    return { valid: false, reason: 'El valor del descuento es inválido.' };
  }

  return { valid: true, reason: '' };
};

couponSchema.methods.calculateDiscount = function (subtotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, subtotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;