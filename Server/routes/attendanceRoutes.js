import express from 'express';
import { 
  getAllAttendance, 
  getAttendanceByDate, 
  getStaffAttendance, 
  markAttendance, 
  updateAttendance 
} from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', getAllAttendance);

router.get('/date/:date', getAttendanceByDate);

router.get('/staff/:staffId', getStaffAttendance);

router.post('/', markAttendance);

router.put('/:id', updateAttendance);

export default router; 