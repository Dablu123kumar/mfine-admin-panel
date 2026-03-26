import mongoose from 'mongoose';

// ─── Payment ───────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    type: { type: String, enum: ['appointment', 'lab-test', 'medicine', 'wallet-topup', 'refund'], required: true },
    reference: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String, enum: ['Appointment', 'LabTest', 'Medicine'] },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'] },
    gateway: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    notes: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function (next) {
  if (!this.transactionId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.transactionId = `TXN${Date.now()}${String(count).padStart(4, '0')}`;
  }
  next();
});

export const Payment = mongoose.model('Payment', paymentSchema);

// ─── Speciality ────────────────────────────────────────────────────────────────
const specialitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    icon: String,
    description: String,
    isActive: { type: Boolean, default: true },
    totalDoctors: { type: Number, default: 0 },
    consultationTypes: [{ type: String, enum: ['chat', 'audio', 'video'] }],
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Speciality = mongoose.model('Speciality', specialitySchema);

// ─── Lab Test ──────────────────────────────────────────────────────────────────
const labTestSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    tests: [
      {
        name: String,
        code: String,
        price: Number,
      },
    ],
    totalAmount: Number,
    status: { type: String, enum: ['ordered', 'sample-collected', 'processing', 'completed', 'cancelled'], default: 'ordered' },
    scheduledAt: Date,
    collectionAddress: String,
    reportUrl: String,
    labName: String,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

labTestSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('LabTest').countDocuments();
    this.orderId = `LAB${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const LabTest = mongoose.model('LabTest', labTestSchema);

// ─── Medicine ──────────────────────────────────────────────────────────────────
const medicineSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        manufacturer: String,
      },
    ],
    totalAmount: Number,
    discount: { type: Number, default: 0 },
    deliveryAddress: {
      line1: String, city: String, state: String, pincode: String,
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    deliveryPartner: String,
    trackingId: String,
    expectedDelivery: Date,
  },
  { timestamps: true }
);

medicineSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('Medicine').countDocuments();
    this.orderId = `MED${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Medicine = mongoose.model('Medicine', medicineSchema);

// ─── Prescription ──────────────────────────────────────────────────────────────
const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: { type: String, unique: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    diagnosis: [String],
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    labTests: [String],
    advice: String,
    followUp: Date,
    pdfUrl: String,
    isValid: { type: Boolean, default: true },
    validUntil: Date,
  },
  { timestamps: true }
);

prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Prescription = mongoose.model('Prescription', prescriptionSchema);

// ─── Notification ──────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error', 'appointment', 'payment', 'system'], default: 'info' },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isGlobal: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    link: String,
    icon: String,
    sentVia: [{ type: String, enum: ['in-app', 'email', 'sms', 'push'] }],
    scheduledAt: Date,
    sentAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
