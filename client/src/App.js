import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import Layout from './components/layout/Layout.js';

// Pages (lazy)
import { lazy, Suspense } from 'react';
const Login = lazy(() => import('./pages/Login.js'));
const Dashboard = lazy(() => import('./pages/Dashboard.js'));
const Doctors = lazy(() => import('./pages/Doctors.js'));
const DoctorDetail = lazy(() => import('./pages/DoctorDetail.js'));
const Patients = lazy(() => import('./pages/Patients.js'));
const PatientDetail = lazy(() => import('./pages/PatientDetail.js'));
const Appointments = lazy(() => import('./pages/Appointments.js'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard.js'));
const Payments = lazy(() => import('./pages/Payments.js'));
const LabTests = lazy(() => import('./pages/LabTests.js'));
const Medicines = lazy(() => import('./pages/Medicines.js'));
const Prescriptions = lazy(() => import('./pages/Prescriptions.js'));
const Specialities = lazy(() => import('./pages/Specialities.js'));
const Users = lazy(() => import('./pages/Users.js'));
const Reports = lazy(() => import('./pages/Reports.js'));
const Notifications = lazy(() => import('./pages/Notifications.js'));
const Settings = lazy(() => import('./pages/Settings.js'));
const Profile = lazy(() => import('./pages/Profile.js'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ width: 36, height: 36, border: '3px solid #E4EAF0', borderTopColor: '#00B5AD', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'user' ? "/customer" : "/"} replace />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'user') return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      {/* Customer Routes */}
      <Route path="/customer/*" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />

      {/* Admin / Staff Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="payments" element={<Payments />} />
        <Route path="lab-tests" element={<LabTests />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="specialities" element={<Specialities />} />
        <Route path="users" element={<ProtectedRoute roles={['superadmin', 'admin']}><Users /></ProtectedRoute>} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
