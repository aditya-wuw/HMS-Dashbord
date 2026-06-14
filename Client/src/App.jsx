import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import DashboardSelection from './components/DashboardSelection'
import PatientDashboard from './components/patient/PatientDashboard'
import StaffDashboard from './components/staff/StaffDashboard'
import FinanceDashboard from './components/finance/FinanceDashboard'
import { AppProvider, useAppContext } from './context/AppContext'

import PatientList from './components/patient/PatientList'
import AppointmentList from './components/patient/AppointmentList'
import NewPatientForm from './components/patient/NewPatientForm'
import NewAppointmentForm from './components/patient/NewAppointmentForm'
import AdmissionsList from './components/patient/AdmissionsList'
import NewAdmissionForm from './components/patient/NewAdmissionForm'

import StaffList from './components/staff/StaffList'
import AttendanceTracker from './components/staff/AttendanceTracker'
import NewStaffForm from './components/staff/NewStaffForm'
import RecordAttendanceForm from './components/staff/RecordAttendanceForm'

import BillingList from './components/finance/BillingList'
import InsuranceClaimsList from './components/finance/InsuranceClaimsList'
import NewBillForm from './components/finance/NewBillForm'
import NewInsuranceClaimForm from './components/finance/NewInsuranceClaimForm'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, userRole } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return children;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={`/dashboard/${userRole.toLowerCase()}`} replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, user, userRole } = useAppContext();

  return (
    <Routes>
      <Route path="/" element={
        <LandingPage />
      } />
      <Route path="/login" element={
        <Login />
      } />
      <Route path="/signup" element={
        <Signup />
      } />
      <Route path="/dashboard" element={
        isAuthenticated ? (
          user?.role === 'admin' ? <DashboardSelection /> : <Navigate to={`/dashboard/${userRole.toLowerCase()}`} replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      {/* Patient Dashboard Routes */}
      <Route path="/dashboard/patient" element={
        <ProtectedRoute requiredRole="patient">
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/records" element={
        <ProtectedRoute requiredRole="patient">
          <PatientList standalone={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/appointments" element={
        <ProtectedRoute requiredRole="patient">
          <AppointmentList standalone={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/admissions" element={
        <ProtectedRoute requiredRole="patient">
          <AdmissionsList standalone={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/new" element={
        <ProtectedRoute requiredRole="patient">
          <NewPatientForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/edit/:id" element={
        <ProtectedRoute requiredRole="patient">
          <NewPatientForm isEditMode={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/appointment/new" element={
        <ProtectedRoute requiredRole="patient">
          <NewAppointmentForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/appointment/edit/:id" element={
        <ProtectedRoute requiredRole="patient">
          <NewAppointmentForm isEditMode={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/admission/new" element={
        <ProtectedRoute requiredRole="patient">
          <NewAdmissionForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/patient/admission/edit/:id" element={
        <ProtectedRoute requiredRole="patient">
          <NewAdmissionForm isEditMode={true} />
        </ProtectedRoute>
      } />

      {/* Staff Dashboard Routes */}
      <Route path="/dashboard/doctor" element={
        <ProtectedRoute requiredRole="doctor">
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/doctor/roster" element={
        <ProtectedRoute requiredRole="doctor">
          <StaffDashboard activeTab="staff" />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/doctor/records" element={
        <ProtectedRoute requiredRole="doctor">
          <StaffDashboard activeTab="records" />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/doctor/attendance" element={
        <ProtectedRoute requiredRole="doctor">
          <StaffDashboard activeTab="attendance" />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/doctor/attendance/record" element={
        <ProtectedRoute requiredRole="doctor">
          <RecordAttendanceForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/doctor/new" element={
        <ProtectedRoute requiredRole="doctor">
          <NewStaffForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/doctor/edit/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <NewStaffForm isEditMode={true} />
        </ProtectedRoute>
      } />

      {/* Finance Dashboard Routes */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute requiredRole="admin">
          <FinanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/billing" element={
        <ProtectedRoute requiredRole="admin">
          <BillingList standalone={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/insurance" element={
        <ProtectedRoute requiredRole="admin">
          <InsuranceClaimsList standalone={true} />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/bills/new" element={
        <ProtectedRoute requiredRole="admin">
          <NewBillForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/insurance/new" element={
        <ProtectedRoute requiredRole="admin">
          <NewInsuranceClaimForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/bills/:id/edit" element={
        <ProtectedRoute requiredRole="admin">
          <NewBillForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/insurance/:id/edit" element={
        <ProtectedRoute requiredRole="admin">
          <NewInsuranceClaimForm />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <AppRoutes />
      </Router>
    </AppProvider>
  )
}

export default App
