import mongoose from 'mongoose';

const medicineCatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'cream', 'inhaler', 'powder', 'other'],
      default: 'tablet',
    },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number },           // max retail price
    discount: { type: Number, default: 0 }, // percentage
    unit: { type: String, default: 'strip' },  // strip, bottle, tube, vial
    strength: { type: String },       // e.g. 500mg, 250ml
    description: { type: String },
    sideEffects: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

medicineCatalogSchema.index({ name: 'text', manufacturer: 'text', genericName: 'text' });
medicineCatalogSchema.index({ isActive: 1, inStock: 1 });

const MedicineCatalog = mongoose.model('MedicineCatalog', medicineCatalogSchema);
export default MedicineCatalog;
