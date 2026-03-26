import express from 'express';
import { protect, adminOnly, managerAndAbove } from '../middleware/authMiddleware.js';
import { userController } from '../controllers/userController.js';
import {
  doctorController, patientController, appointmentController,
  paymentController, specialityController, labTestController,
  medicineController, prescriptionController,
} from '../controllers/resourceControllers.js';
import { getDashboardStats, getActivityFeed } from '../controllers/dashboardController.js';
import { Notification } from '../models/index.js';
import { createOne, getAll, getOne, updateOne } from '../controllers/crudFactory.js';

// ─── User Routes ──────────────────────────────────────────────────────────────
export const userRouter = express.Router();
userRouter.use(protect, adminOnly);
userRouter.route('/').get(userController.getAll).post(userController.create);
userRouter.route('/:id').get(userController.getOne).put(userController.update).delete(userController.delete);
userRouter.put('/:id/toggle-status', userController.toggleStatus);
userRouter.put('/:id/role', userController.updateRole);

// ─── Doctor Routes ────────────────────────────────────────────────────────────
export const doctorRouter = express.Router();
doctorRouter.use(protect);
doctorRouter.route('/').get(doctorController.getAll).post(managerAndAbove, doctorController.create);
doctorRouter.get('/stats', doctorController.getStats);
doctorRouter.route('/:id').get(doctorController.getOne).put(managerAndAbove, doctorController.update).delete(adminOnly, doctorController.delete);
doctorRouter.put('/:id/verify', adminOnly, doctorController.verify);
doctorRouter.put('/:id/suspend', adminOnly, doctorController.suspend);

// ─── Patient Routes ───────────────────────────────────────────────────────────
export const patientRouter = express.Router();
patientRouter.use(protect);
patientRouter.route('/').get(patientController.getAll).post(patientController.create);
patientRouter.get('/stats', patientController.getStats);
patientRouter.route('/:id').get(patientController.getOne).put(patientController.update).delete(adminOnly, patientController.delete);
patientRouter.put('/:id/block', adminOnly, patientController.block);
patientRouter.put('/:id/wallet', managerAndAbove, patientController.addWallet);

// ─── Appointment Routes ───────────────────────────────────────────────────────
export const appointmentRouter = express.Router();
appointmentRouter.use(protect);
appointmentRouter.route('/').get(appointmentController.getAll).post(appointmentController.create);
appointmentRouter.get('/stats', appointmentController.getStats);
appointmentRouter.route('/:id').get(appointmentController.getOne).put(appointmentController.update).delete(adminOnly, appointmentController.delete);
appointmentRouter.put('/:id/cancel', appointmentController.cancel);

// ─── Payment Routes ───────────────────────────────────────────────────────────
export const paymentRouter = express.Router();
paymentRouter.use(protect);
paymentRouter.route('/').get(paymentController.getAll);
paymentRouter.get('/stats', paymentController.getStats);
paymentRouter.route('/:id').get(paymentController.getOne).put(managerAndAbove, paymentController.update);
paymentRouter.post('/:id/refund', managerAndAbove, paymentController.refund);

// ─── Speciality Routes ────────────────────────────────────────────────────────
export const specialityRouter = express.Router();
specialityRouter.use(protect);
specialityRouter.route('/').get(specialityController.getAll).post(adminOnly, specialityController.create);
specialityRouter.route('/:id').get(specialityController.getOne).put(adminOnly, specialityController.update).delete(adminOnly, specialityController.delete);

// ─── Lab Test Routes ──────────────────────────────────────────────────────────
export const labTestRouter = express.Router();
labTestRouter.use(protect);
labTestRouter.route('/').get(labTestController.getAll);
labTestRouter.route('/:id').get(labTestController.getOne).put(labTestController.update).delete(adminOnly, labTestController.delete);

// ─── Medicine Routes ──────────────────────────────────────────────────────────
export const medicineRouter = express.Router();
medicineRouter.use(protect);
medicineRouter.route('/').get(medicineController.getAll);
medicineRouter.route('/:id').get(medicineController.getOne).put(medicineController.update).delete(adminOnly, medicineController.delete);

// ─── Prescription Routes ──────────────────────────────────────────────────────
export const prescriptionRouter = express.Router();
prescriptionRouter.use(protect);
prescriptionRouter.route('/').get(prescriptionController.getAll);
prescriptionRouter.route('/:id').get(prescriptionController.getOne).put(prescriptionController.update);

// ─── Dashboard Routes ─────────────────────────────────────────────────────────
export const dashboardRouter = express.Router();
dashboardRouter.use(protect);
dashboardRouter.get('/stats', getDashboardStats);
dashboardRouter.get('/activity', getActivityFeed);

// ─── Notification Routes ──────────────────────────────────────────────────────
export const notificationRouter = express.Router();
notificationRouter.use(protect);
notificationRouter.route('/').get(getAll(Notification)).post(adminOnly, createOne(Notification));
notificationRouter.route('/:id').get(getOne(Notification)).put(adminOnly, updateOne(Notification));
notificationRouter.put('/:id/read', async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
});

// ─── Report Routes ────────────────────────────────────────────────────────────
export const reportRouter = express.Router();
reportRouter.use(protect);
reportRouter.get('/revenue', async (req, res, next) => {
  try {
    const { Payment } = await import('../models/index.js');
    const { startDate, endDate } = req.query;
    const match = { status: 'success' };
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const data = await Payment.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
});
