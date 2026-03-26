import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { Payment, LabTest, Medicine } from '../models/index.js';

// @desc    Get dashboard overview stats
// @route   GET /api/v1/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalDoctors, totalPatients, totalAppointments, totalRevenue,
      todayAppointments, monthlyAppointments, newPatientsThisMonth,
      pendingDoctors, activeAppointments,
    ] = await Promise.all([
      Doctor.countDocuments({ status: 'active' }),
      Patient.countDocuments({ status: 'active' }),
      Appointment.countDocuments(),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Appointment.countDocuments({ scheduledAt: { $gte: today } }),
      Appointment.countDocuments({ scheduledAt: { $gte: thisMonth } }),
      Patient.countDocuments({ createdAt: { $gte: thisMonth } }),
      Doctor.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: { $in: ['scheduled', 'in-progress'] } }),
    ]);

    // Revenue trend last 7 days
    const revenueTrend = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Appointment by type
    const appointmentByType = await Appointment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top specialities
    const topSpecialities = await Appointment.aggregate([
      { $group: { _id: '$speciality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'specialities', localField: '_id', foreignField: '_id', as: 'speciality' } },
      { $unwind: { path: '$speciality', preserveNullAndEmptyArrays: true } },
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .sort('-createdAt')
      .limit(5)
      .populate('patient', 'name avatar')
      .populate('doctor', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDoctors,
          totalPatients,
          totalAppointments,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayAppointments,
          monthlyAppointments,
          newPatientsThisMonth,
          pendingDoctors,
          activeAppointments,
        },
        revenueTrend,
        appointmentByType,
        monthlyRevenue,
        topSpecialities,
        recentAppointments,
      },
    });
  } catch (err) { next(err); }
};

// @desc    Get activity feed
// @route   GET /api/v1/dashboard/activity
export const getActivityFeed = async (req, res, next) => {
  try {
    const [recentPatients, recentDoctors, recentPayments, recentAppointments] = await Promise.all([
      Patient.find().sort('-createdAt').limit(3).select('name email createdAt'),
      Doctor.find().sort('-createdAt').limit(3).select('name email status createdAt'),
      Payment.find({ status: 'success' }).sort('-createdAt').limit(3).populate('patient', 'name'),
      Appointment.find().sort('-createdAt').limit(3).populate('patient', 'name').populate('doctor', 'name'),
    ]);

    const feed = [
      ...recentPatients.map((p) => ({ type: 'patient_registered', data: p, time: p.createdAt })),
      ...recentDoctors.map((d) => ({ type: 'doctor_joined', data: d, time: d.createdAt })),
      ...recentPayments.map((p) => ({ type: 'payment_received', data: p, time: p.createdAt })),
      ...recentAppointments.map((a) => ({ type: 'appointment_booked', data: a, time: a.createdAt })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.status(200).json({ success: true, data: feed });
  } catch (err) { next(err); }
};
