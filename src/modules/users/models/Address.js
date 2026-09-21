import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientName: { type: String, required: true, maxlength: 150 },
    phone: { type: String, default: '', maxlength: 20 },
    addressLine: { type: String, required: true, maxlength: 255 },
    addressLine2: { type: String, default: '', maxlength: 255 },
    city: { type: String, required: true, maxlength: 100 },
    department: { type: String, required: true, maxlength: 100 },
    postalCode: { type: String, default: '', maxlength: 10 },
    instructions: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

addressSchema.index({ user: 1, isActive: 1 });

addressSchema.pre('save', async function (next) {
  if (this.isDefault && !this.isActive) {
    this.isDefault = false;
  }
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, isDefault: true, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;