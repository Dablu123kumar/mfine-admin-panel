# MFine Admin Panel — MERN Stack MVC

A comprehensive, production-grade Admin Panel for the **MFine healthcare platform**, built with the MERN stack (MongoDB, Express, React, Node.js) in **ES6+ JavaScript** following strict **MVC architecture**.

---

## 🏗️ Project Structure

```
mfine-admin/
├── server/                        # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Auth logic (login, register, JWT)
│   │   ├── crudFactory.js         # Generic reusable CRUD factory
│   │   ├── dashboardController.js # Dashboard stats & activity feed
│   │   ├── resourceControllers.js # Doctor, Patient, Appointment, Payment controllers
│   │   └── userController.js      # Admin user management
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + RBAC authorize
│   │   ├── errorMiddleware.js     # Global error handler
│   │   ├── rateLimiter.js         # Express-rate-limit
│   │   ├── uploadMiddleware.js    # Multer file uploads
│   │   └── validationMiddleware.js# Express-validator rules
│   ├── models/
│   │   ├── User.js                # Admin user model
│   │   ├── Doctor.js              # Doctor model
│   │   ├── Patient.js             # Patient model
│   │   ├── Appointment.js         # Appointment model
│   │   └── index.js               # Payment, Speciality, LabTest, Medicine,
│   │                              #   Prescription, Notification models
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── labTestRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── specialityRoutes.js
│   │   ├── userRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js           # Nodemailer email utility
│   │   └── seeder.js              # Database seed script
│   └── index.js                   # Express app entry point
│
├── client/                        # Frontend (React 18)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── common/            # Reusable UI components
│       │   │   ├── index.js       # Spinner, Modal, Pagination, StatusBadge...
│       │   │   └── DoctorFormModal.js
│       │   └── layout/
│       │       ├── Layout.js      # Main layout wrapper
│       │       ├── Sidebar.js     # Collapsible sidebar
│       │       └── Topbar.js      # Top navigation bar
│       ├── context/
│       │   └── AuthContext.js     # Global auth state
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Dashboard.js       # Charts, stats, activity feed
│       │   ├── Doctors.js         # CRUD + verify/suspend
│       │   ├── DoctorDetail.js    # Doctor profile view
│       │   ├── Patients.js        # CRUD + block/wallet
│       │   ├── PatientDetail.js   # Patient profile view
│       │   ├── Appointments.js    # Manage + cancel
│       │   ├── Payments.js        # Transactions + refunds
│       │   ├── LabTests.js        # Lab order management
│       │   ├── Medicines.js       # Medicine order management
│       │   ├── Prescriptions.js   # Prescription viewer
│       │   ├── Specialities.js    # CRUD specialities
│       │   ├── Users.js           # Admin user management
│       │   ├── Reports.js         # Revenue reports + charts
│       │   ├── Notifications.js   # Send & view notifications
│       │   ├── Settings.js        # Platform settings
│       │   └── Profile.js         # Profile + password change
│       ├── utils/
│       │   └── api.js             # Axios instance + all API helpers
│       ├── App.js                 # Router + lazy loading
│       └── index.js               # React entry point
│
├── .env.example                   # Environment variable template
├── package.json                   # Root dependencies
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Clone & Install

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and SMTP settings
```

### 4. Seed the Database

```bash
npm run seed
```

This creates:
- **4 admin users** (superadmin, admin, finance, support)
- **12 specialities**
- **30 doctors**
- **50 patients**
- **80 appointments**
- **Payment records**

### 5. Run the App

```bash
# Development (server + client concurrently)
npm run dev:full

# Or separately:
npm run dev        # Server on :5000
cd client && npm start  # Client on :3000
```

---

## 🔐 Default Login Credentials

| Role        | Email                      | Password    |
|-------------|----------------------------|-------------|
| superadmin  | superadmin@mfine.com       | Admin@123   |
| admin       | admin@mfine.com            | Admin@123   |
| finance     | finance@mfine.com          | Admin@123   |
| support     | support@mfine.com          | Admin@123   |

---

## ✨ Features

### Dashboard
- Real-time KPI cards (doctors, patients, appointments, revenue)
- 7-day revenue trend line chart
- Monthly revenue bar chart
- Consultation type doughnut chart
- Recent appointments table
- Live activity feed

### Doctor Management
- Full CRUD with form modal
- Verify / Suspend actions
- Filter by status, search by name/email
- Stats cards (total, active, pending, suspended)
- Detailed profile view with fees, qualifications, bio

### Patient Management
- Full CRUD with search/filter
- Block patient, add wallet balance
- Detailed profile: medical history, allergies, insurance, address

### Appointment Management
- View all appointments with patient & doctor info
- Filter by status and type (chat/audio/video)
- Cancel with reason
- Stats: today, pending, completed, cancelled

### Payment & Finance
- Transaction history with full details
- Refund processing with amount & reason
- Revenue stats (total, refunded, pending)

### Lab Tests & Medicines
- Order tracking with status management
- Patient and item details

### Prescriptions
- View all prescriptions with doctor/patient info
- Diagnosis, medicines, validity status

### Specialities
- Visual card-based CRUD
- Emoji icon support

### Admin Users
- Manage all admin accounts
- Role-based: superadmin, admin, manager, support, finance
- Last login tracking

### Reports
- Custom date range revenue reports
- Line chart visualization
- Daily average, total transactions

### Notifications
- Send global or targeted notifications
- 7 notification types
- In-app notification center

### Auth & Security
- JWT access tokens with cookie support
- Role-Based Access Control (RBAC)
- Rate limiting on auth routes
- Forgot password / reset via email
- Password hashing with bcrypt (salt 12)
- Helmet.js security headers

---

## 🛠️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Backend    | Node.js, Express.js (ES6 modules)           |
| Database   | MongoDB, Mongoose ODM                       |
| Auth       | JWT, bcryptjs, cookie-parser                |
| Validation | express-validator                           |
| File Upload| Multer                                      |
| Email      | Nodemailer                                  |
| Frontend   | React 18, React Router v6                   |
| State      | React Query (TanStack), Context API         |
| Charts     | Chart.js + react-chartjs-2                  |
| HTTP       | Axios with interceptors                     |
| UI         | Custom CSS design system (no UI framework)  |
| Fonts      | Syne (display) + DM Sans (body)             |
| Icons      | Lucide React                                |

---

## 🏛️ MVC Architecture

```
Request → Route → Middleware → Controller → Model → Response
                     ↓
              (auth, validate,
               rate-limit, upload)
```

- **Models** — Mongoose schemas with methods and hooks
- **Views** — React components (client-side rendering)
- **Controllers** — Business logic, separated per resource
- **Routes** — Express routers with middleware chains
- **Middleware** — Auth guard, RBAC, validation, rate limiting

---

## 📡 API Reference

All routes are prefixed with `/api/v1/`

| Method | Endpoint                        | Description                  | Auth      |
|--------|---------------------------------|------------------------------|-----------|
| POST   | /auth/login                     | Admin login                  | Public    |
| GET    | /auth/me                        | Get current user             | Protected |
| GET    | /dashboard/stats                | Dashboard KPIs               | Protected |
| GET    | /doctors                        | List doctors (paginated)     | Protected |
| POST   | /doctors                        | Create doctor                | Manager+  |
| PUT    | /doctors/:id/verify             | Verify doctor                | Admin+    |
| PUT    | /doctors/:id/suspend            | Suspend doctor               | Admin+    |
| GET    | /patients                       | List patients                | Protected |
| PUT    | /patients/:id/wallet            | Add wallet balance           | Manager+  |
| GET    | /appointments                   | List appointments            | Protected |
| PUT    | /appointments/:id/cancel        | Cancel appointment           | Protected |
| GET    | /payments                       | List transactions            | Protected |
| POST   | /payments/:id/refund            | Process refund               | Manager+  |
| GET    | /reports/revenue                | Revenue report               | Protected |
| POST   | /notifications                  | Send notification            | Admin+    |
| GET    | /users                          | List admin users             | Admin+    |
