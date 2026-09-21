import mongoose from 'mongoose';

const MOVEMENT_TYPES = ['entrada', 'salida', 'ajuste'];

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    quantity: { type: Number, required: true },
    movementType: { type: String, enum: MOVEMENT_TYPES, required: true },
    reason: { type: String, default: '', maxlength: 255 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

export default InventoryMovement;