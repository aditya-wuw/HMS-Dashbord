import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments,
  getPatientAdmissions,
  getAllAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  getAllAdmissions,
  createAdmission,
  updateAdmission,
  dischargePatient
} from '../controllers/patientController.js';

const router = express.Router();

router.get('/', getPatients);

router.get('/appointments', getAllAppointments);

router.post('/appointments', createAppointment);

router.put('/appointments/:id', updateAppointment);

router.patch('/appointments/:id/status', updateAppointmentStatus);

router.get('/admissions', getAllAdmissions);

router.post('/admissions', createAdmission);

router.put('/admissions/:id', updateAdmission);

router.patch('/admissions/:id/discharge', dischargePatient);

router.get('/:id', getPatientById);

router.post('/', createPatient);

router.put('/:id', updatePatient);

router.delete('/:id', deletePatient);

router.get('/:id/appointments', getPatientAppointments);

router.get('/:id/admissions', getPatientAdmissions);

export default router; 