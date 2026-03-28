import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true },
    customerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // Optional for customer booking
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    speciality: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' },
    type: { type: String, enum: ['chat', 'audio', 'video'], required: true },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
      default: 'scheduled',
    },
    scheduledAt: { type: Date, required: true },
    startedAt: Date,
    completedAt: Date,
    duration: Number, // minutes
    chiefComplaint: String,
    symptoms: [String],
    notes: {
      doctor: String,
      admin: String,
    },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    followUpDate: Date,
    isFollowUp: { type: Boolean, default: false },
    parentAppointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    fee: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'waived'], default: 'pending' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    cancelReason: String,
    cancelledBy: { type: String, enum: ['patient', 'doctor', 'admin'] },
    reminderSent: { type: Boolean, default: false },
    sessionLink: String,
    recordingUrl: String,
  },
  { timestamps: true }
);

// Auto-generate appointment ID
appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

appointmentSchema.index({ patient: 1, doctor: 1, scheduledAt: -1 });
appointmentSchema.index({ status: 1, scheduledAt: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
