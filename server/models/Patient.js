import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    age: Number,
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
    avatar: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    medicalHistory: [
      {
        condition: String,
        since: Date,
        notes: String,
      },
    ],
    allergies: [String],
    currentMedications: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    familyMembers: [
      {
        name: String,
        relation: String,
        age: Number,
        gender: String,
      },
    ],
    wallet: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    isVerified: { type: Boolean, default: false },
    registeredVia: { type: String, enum: ['app', 'web', 'admin'], default: 'app' },
    corporateId: String,
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      validUntil: Date,
    },
    lastActive: Date,
  },
  { timestamps: true }
);

patientSchema.index({ name: 'text', email: 'text', phone: 'text' });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
