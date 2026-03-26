import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { Payment, Speciality } from '../models/index.js';

dotenv.config();

// ─── Seed Data ────────────────────────────────────────────────────────────────
const specialityData = [
  { name: 'General Physician', icon: '🩺', description: 'Primary care and general health' },
  { name: 'Dermatology', icon: '🧴', description: 'Skin, hair, and nail conditions' },
  { name: 'Cardiology', icon: '🫀', description: 'Heart and cardiovascular system' },
  { name: 'Pediatrics', icon: '👶', description: 'Child healthcare' },
  { name: 'Psychiatry', icon: '🧠', description: 'Mental health and behavioural disorders' },
  { name: 'Gynaecology', icon: '🌸', description: "Women's reproductive health" },
  { name: 'Orthopaedics', icon: '🦴', description: 'Bones, joints, and muscles' },
  { name: 'ENT', icon: '👂', description: 'Ear, nose, and throat' },
  { name: 'Ophthalmology', icon: '👁️', description: 'Eye care' },
  { name: 'Dentistry', icon: '🦷', description: 'Oral and dental health' },
  { name: 'Neurology', icon: '🧬', description: 'Nervous system disorders' },
  { name: 'Endocrinology', icon: '⚗️', description: 'Hormonal and metabolic disorders' },
];

const adminUsers = [
  { name: 'Super Admin', email: 'superadmin@mfine.com', password: 'Admin@123', role: 'superadmin', department: 'Executive' },
  { name: 'Admin User', email: 'admin@mfine.com', password: 'Admin@123', role: 'admin', department: 'Operations' },
  { name: 'Finance Manager', email: 'finance@mfine.com', password: 'Admin@123', role: 'finance', department: 'Finance' },
  { name: 'Support Staff', email: 'support@mfine.com', password: 'Admin@123', role: 'support', department: 'Customer Support' },
];

const FIRST_NAMES = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Arun', 'Kavita', 'Vikram', 'Deepa', 'Sanjay', 'Pooja', 'Ramesh', 'Sunita', 'Anand', 'Meera', 'Rajesh'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Mehta', 'Reddy', 'Joshi', 'Nair', 'Iyer', 'Pillai', 'Das', 'Bose', 'Rao'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Chandigarh', 'Jaipur'];

const randomName = () => `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
const randomPhone = () => `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`;
const randomCity = () => CITIES[Math.floor(Math.random() * CITIES.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

const seedDB = async () => {
  await connectDB();
  console.log('🌱 Starting database seed...\n');

  // Clear collections
  await Promise.all([
    User.deleteMany({}), Doctor.deleteMany({}), Patient.deleteMany({}),
    Appointment.deleteMany({}), Payment.deleteMany({}), Speciality.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Seed specialities
  const specialities = await Speciality.insertMany(specialityData.map(s => ({ ...s, isActive: true })));
  console.log(`✅ Created ${specialities.length} specialities`);

  // Seed admin users
  const users = await User.insertMany(adminUsers);
  console.log(`✅ Created ${users.length} admin users`);
  console.log('\n📋 Admin Login Credentials:');
  adminUsers.forEach(u => console.log(`   ${u.role.padEnd(12)} | ${u.email.padEnd(30)} | ${u.password}`));

  // Seed doctors
  const doctors = [];
  for (let i = 0; i < 30; i++) {
    const name = randomName();
    const speciality = specialities[randomInt(0, specialities.length - 1)];
    doctors.push({
      name: `Dr. ${name}`,
      email: `dr.${name.toLowerCase().replace(' ', '.')}${i}@mfine.com`,
      phone: randomPhone(),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      speciality: speciality._id,
      experience: randomInt(2, 25),
      registrationNumber: `MCI${randomInt(100000, 999999)}`,
      languages: ['English', 'Hindi'],
      consultationFee: { chat: randomInt(100, 300), audio: randomInt(200, 500), video: randomInt(300, 700) },
      rating: randomFloat(3.5, 5.0),
      totalConsultations: randomInt(50, 2000),
      totalReviews: randomInt(20, 500),
      status: Math.random() > 0.2 ? 'active' : Math.random() > 0.5 ? 'pending' : 'inactive',
      isVerified: Math.random() > 0.25,
      bio: `Experienced ${speciality.name} specialist with ${randomInt(2, 25)} years of practice.`,
      earnings: randomInt(50000, 500000),
    });
  }
  const savedDoctors = await Doctor.insertMany(doctors);
  console.log(`\n✅ Created ${savedDoctors.length} doctors`);

  // Update speciality totalDoctors
  for (const sp of specialities) {
    const count = savedDoctors.filter(d => d.speciality.toString() === sp._id.toString()).length;
    await Speciality.findByIdAndUpdate(sp._id, { totalDoctors: count });
  }

  // Seed patients
  const patients = [];
  for (let i = 0; i < 50; i++) {
    const name = randomName();
    patients.push({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}${i}@gmail.com`,
      phone: randomPhone(),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      dateOfBirth: new Date(Date.now() - randomInt(18, 70) * 365 * 24 * 60 * 60 * 1000),
      bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][randomInt(0, 7)],
      address: { city: randomCity(), state: 'India', country: 'India' },
      wallet: randomInt(0, 5000),
      totalAppointments: randomInt(0, 20),
      totalSpent: randomInt(0, 15000),
      status: Math.random() > 0.1 ? 'active' : 'blocked',
      isVerified: Math.random() > 0.3,
      registeredVia: ['app', 'web'][randomInt(0, 1)],
    });
  }
  const savedPatients = await Patient.insertMany(patients);
  console.log(`✅ Created ${savedPatients.length} patients`);

  // Seed appointments
  const appointments = [];
  const types = ['chat', 'audio', 'video'];
  const statuses = ['scheduled', 'completed', 'cancelled', 'in-progress'];
  for (let i = 0; i < 80; i++) {
    const doctor = savedDoctors[randomInt(0, savedDoctors.length - 1)];
    const patient = savedPatients[randomInt(0, savedPatients.length - 1)];
    const type = types[randomInt(0, 2)];
    const status = statuses[randomInt(0, 3)];
    const daysOffset = randomInt(-30, 30);
    appointments.push({
      patient: patient._id,
      doctor: doctor._id,
      speciality: doctor.speciality,
      type,
      status,
      scheduledAt: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000),
      fee: doctor.consultationFee[type],
      paymentStatus: status === 'completed' ? 'paid' : 'pending',
      chiefComplaint: 'General consultation',
    });
  }
  const savedAppointments = await Appointment.insertMany(appointments);
  console.log(`✅ Created ${savedAppointments.length} appointments`);

  // Seed payments
  const payments = [];
  const completedApts = savedAppointments.filter(a => a.status === 'completed');
  const methods = ['upi', 'card', 'netbanking', 'wallet'];
  for (const apt of completedApts) {
    payments.push({
      patient: apt.patient,
      type: 'appointment',
      reference: apt._id,
      referenceModel: 'Appointment',
      amount: apt.fee,
      status: 'success',
      method: methods[randomInt(0, 3)],
      gateway: 'razorpay',
      createdAt: new Date(apt.scheduledAt.getTime() - randomInt(1, 24) * 60 * 60 * 1000),
    });
  }
  // Add some wallet top-ups
  for (let i = 0; i < 20; i++) {
    payments.push({
      patient: savedPatients[randomInt(0, savedPatients.length - 1)]._id,
      type: 'wallet-topup',
      amount: randomInt(200, 2000),
      status: 'success',
      method: methods[randomInt(0, 3)],
    });
  }
  await Payment.insertMany(payments);
  console.log(`✅ Created ${payments.length} payment records`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n🚀 Start the server: npm run dev');
  console.log('🌐 Client: cd client && npm start\n');
  process.exit(0);
};

seedDB().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
