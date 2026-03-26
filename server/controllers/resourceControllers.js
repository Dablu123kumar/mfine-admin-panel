import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { Payment, LabTest, Medicine, Prescription, Speciality } from '../models/index.js';
import { createOne, getAll, getOne, updateOne, deleteOne } from './crudFactory.js';

// ─── Doctor Controller ────────────────────────────────────────────────────────
export const doctorController = {
  create: createOne(Doctor),
  getAll: getAll(Doctor, 'speciality'),
  getOne: getOne(Doctor, 'speciality'),
  update: updateOne(Doctor),
  delete: deleteOne(Doctor),

  verify: async (req, res, next) => {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id, { isVerified: true, status: 'active' }, { new: true }
      );
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
      res.status(200).json({ success: true, data: doctor, message: 'Doctor verified successfully' });
    } catch (err) { next(err); }
  },

  suspend: async (req, res, next) => {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id, { status: 'suspended' }, { new: true }
      );
      res.status(200).json({ success: true, data: doctor });
    } catch (err) { next(err); }
  },

  getStats: async (req, res, next) => {
    try {
      const [total, active, pending, suspended] = await Promise.all([
        Doctor.countDocuments(),
        Doctor.countDocuments({ status: 'active' }),
        Doctor.countDocuments({ status: 'pending' }),
        Doctor.countDocuments({ status: 'suspended' }),
      ]);
      res.status(200).json({ success: true, data: { total, active, pending, suspended } });
    } catch (err) { next(err); }
  },
};

// ─── Patient Controller ───────────────────────────────────────────────────────
export const patientController = {
  create: createOne(Patient),
  getAll: getAll(Patient),
  getOne: getOne(Patient),
  update: updateOne(Patient),
  delete: deleteOne(Patient),

  block: async (req, res, next) => {
    try {
      const patient = await Patient.findByIdAndUpdate(
        req.params.id, { status: 'blocked' }, { new: true }
      );
      res.status(200).json({ success: true, data: patient });
    } catch (err) { next(err); }
  },

  addWallet: async (req, res, next) => {
    try {
      const { amount } = req.body;
      const patient = await Patient.findByIdAndUpdate(
        req.params.id, { $inc: { wallet: amount } }, { new: true }
      );
      res.status(200).json({ success: true, data: patient });
    } catch (err) { next(err); }
  },

  getStats: async (req, res, next) => {
    try {
      const [total, active, blocked] = await Promise.all([
        Patient.countDocuments(),
        Patient.countDocuments({ status: 'active' }),
        Patient.countDocuments({ status: 'blocked' }),
      ]);
      res.status(200).json({ success: true, data: { total, active, blocked } });
    } catch (err) { next(err); }
  },
};

// ─── Appointment Controller ───────────────────────────────────────────────────
export const appointmentController = {
  create: createOne(Appointment),
  getAll: getAll(Appointment, [
    { path: 'patient', select: 'name email phone avatar' },
    { path: 'doctor', select: 'name email avatar speciality' },
    { path: 'speciality', select: 'name icon' },
  ]),
  getOne: getOne(Appointment, [
    { path: 'patient' }, { path: 'doctor' }, { path: 'prescription' },
  ]),
  update: updateOne(Appointment),
  delete: deleteOne(Appointment),

  cancel: async (req, res, next) => {
    try {
      const apt = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled', cancelReason: req.body.reason, cancelledBy: 'admin' },
        { new: true }
      );
      res.status(200).json({ success: true, data: apt });
    } catch (err) { next(err); }
  },

  getStats: async (req, res, next) => {
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

      const [total, today_count, completed, cancelled, pending] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ scheduledAt: { $gte: today, $lt: tomorrow } }),
        Appointment.countDocuments({ status: 'completed' }),
        Appointment.countDocuments({ status: 'cancelled' }),
        Appointment.countDocuments({ status: 'scheduled' }),
      ]);
      res.status(200).json({ success: true, data: { total, today: today_count, completed, cancelled, pending } });
    } catch (err) { next(err); }
  },
};

// ─── Payment Controller ───────────────────────────────────────────────────────
export const paymentController = {
  getAll: getAll(Payment, { path: 'patient', select: 'name email' }),
  getOne: getOne(Payment, { path: 'patient', select: 'name email phone' }),
  update: updateOne(Payment),

  refund: async (req, res, next) => {
    try {
      const { amount, reason } = req.body;
      const payment = await Payment.findByIdAndUpdate(
        req.params.id,
        { status: 'refunded', refundAmount: amount, refundReason: reason, refundedAt: Date.now() },
        { new: true }
      );
      res.status(200).json({ success: true, data: payment });
    } catch (err) { next(err); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await Payment.aggregate([
        { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]);
      res.status(200).json({ success: true, data: stats });
    } catch (err) { next(err); }
  },
};

// ─── Speciality Controller ────────────────────────────────────────────────────
export const specialityController = {
  create: createOne(Speciality),
  getAll: getAll(Speciality),
  getOne: getOne(Speciality),
  update: updateOne(Speciality),
  delete: deleteOne(Speciality),
};

// ─── Lab Test Controller ──────────────────────────────────────────────────────
export const labTestController = {
  getAll: getAll(LabTest, { path: 'patient', select: 'name email phone' }),
  getOne: getOne(LabTest, { path: 'patient' }),
  update: updateOne(LabTest),
  delete: deleteOne(LabTest),
};

// ─── Medicine Controller ──────────────────────────────────────────────────────
export const medicineController = {
  getAll: getAll(Medicine, { path: 'patient', select: 'name email phone' }),
  getOne: getOne(Medicine, { path: 'patient' }),
  update: updateOne(Medicine),
  delete: deleteOne(Medicine),
};

// ─── Prescription Controller ──────────────────────────────────────────────────
export const prescriptionController = {
  getAll: getAll(Prescription, [
    { path: 'doctor', select: 'name' },
    { path: 'patient', select: 'name email' },
  ]),
  getOne: getOne(Prescription, [
    { path: 'doctor' }, { path: 'patient' }, { path: 'appointment' },
  ]),
  update: updateOne(Prescription),
};
