import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
  getStaffByRole,
  getDoctorAppointments,
  getStaffSchedule
} from '../controllers/staffController.js';

const router = express.Router();

router.get('/', getAllStaff);

router.get('/:id', getStaffById);

router.post('/', createStaff);

router.put('/:id', updateStaff);

router.delete('/:id', deleteStaff);

router.get('/department/:department', getStaffByDepartment);

router.get('/role/:role', getStaffByRole);

router.get('/:id/appointments', getDoctorAppointments);

router.get('/:id/schedule', getStaffSchedule);

export default router; 