import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    avatar: String,
    speciality: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', required: true },
    subSpecialities: [String],
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    experience: { type: Number, default: 0 }, // years
    registrationNumber: { type: String, unique: true },
    hospitalAffiliations: [String],
    languages: [String],
    bio: String,
    consultationFee: {
      chat: { type: Number, default: 0 },
      audio: { type: Number, default: 0 },
      video: { type: Number, default: 0 },
    },
    availability: [
      {
        day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
        slots: [{ start: String, end: String }],
      },
    ],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    isVerified: { type: Boolean, default: false },
    documents: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

doctorSchema.index({ name: 'text', email: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
