import Appointment from '../models/Appointment.js';
import { LabTest, Medicine, Payment, Prescription } from '../models/index.js';

export const customerController = {
  getAppointments: async (req, res, next) => {
    try {
      const appointments = await Appointment.find({ customerUserId: req.user._id })
        .populate('doctor', 'name speciality avatar fee')
        .populate('speciality', 'name')
        .sort('-createdAt');
      res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) { next(err); }
  },

  bookAppointment: async (req, res, next) => {
    try {
      const { doctorId, type, ...rest } = req.body;
      const { default: Doctor } = await import('../models/Doctor.js');
      
      const doc = await Doctor.findById(doctorId);
      if (!doc) return res.status(404).json({ success: false, message: 'Doctor not found' });
      
      const fee = doc.consultationFee?.[type] || 0;

      const apt = await Appointment.create({
        ...rest,
        type,
        doctor: doctorId,
        speciality: doc.speciality,
        fee,
        customerUserId: req.user._id,
        status: 'scheduled',
      });
      res.status(201).json({ success: true, data: apt });
    } catch (err) { next(err); }
  },

  getLabTests: async (req, res, next) => {
    try {
      const tests = await LabTest.find({ customerUserId: req.user._id }).sort('-createdAt');
      res.status(200).json({ success: true, data: tests });
    } catch (err) { next(err); }
  },

  orderLabTest: async (req, res, next) => {
    try {
      const test = await LabTest.create({
        ...req.body,
        customerUserId: req.user._id,
      });
      res.status(201).json({ success: true, data: test });
    } catch (err) { next(err); }
  },

  getMedicines: async (req, res, next) => {
    try {
      const meds = await Medicine.find({ customerUserId: req.user._id }).sort('-createdAt');
      res.status(200).json({ success: true, data: meds });
    } catch (err) { next(err); }
  },

  orderMedicine: async (req, res, next) => {
    try {
      const order = await Medicine.create({
        ...req.body,
        customerUserId: req.user._id,
      });
      res.status(201).json({ success: true, data: order });
    } catch (err) { next(err); }
  },

  getPayments: async (req, res, next) => {
    try {
      const payments = await Payment.find({ customerUserId: req.user._id }).sort('-createdAt');
      res.status(200).json({ success: true, data: payments });
    } catch (err) { next(err); }
  },

  processPayment: async (req, res, next) => {
    try {
      const { referenceId, referenceModel, ...rest } = req.body;
      const payment = await Payment.create({
        ...rest,
        reference: referenceId,
        referenceModel,
        customerUserId: req.user._id,
        status: 'success'
      });
      
      if (referenceId && referenceModel) {
        const mongoose = (await import('mongoose')).default;
        const Model = mongoose.model(referenceModel);
        if (Model) {
          await Model.findByIdAndUpdate(referenceId, { payment: payment._id, paymentStatus: 'paid' });
        }
      }
      res.status(201).json({ success: true, data: payment });
    } catch (err) { next(err); }
  },

  getPrescriptions: async (req, res, next) => {
    try {
      // Find prescriptions linked to appointments owned by customer
      const appointments = await Appointment.find({ customerUserId: req.user._id });
      const appointmentIds = appointments.map(a => a._id);

      const prescriptions = await Prescription.find({
        appointment: { $in: appointmentIds }
      }).populate('doctor', 'name').sort('-createdAt');
      res.status(200).json({ success: true, data: prescriptions });
    } catch (err) { next(err); }
  }
};
