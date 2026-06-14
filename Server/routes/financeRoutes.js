import express from 'express';
import {
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  getBillsByStatus,
  getPatientBills,
  recordPayment,
  getAllInsuranceClaims,
  getInsuranceClaimById,
  createInsuranceClaim,
  updateInsuranceClaim,
  updateClaimStatus,
  deleteInsuranceClaim,
  getInsuranceClaimsByStatus,
  getPatientInsuranceClaims,
  getRevenueStats,
  getPendingPayments,
  getOverduePayments
} from '../controllers/financeController.js';

const router = express.Router();

router.get('/bills', getAllBills);

router.get('/bills/:id', getBillById);

router.post('/bills', createBill);

router.put('/bills/:id', updateBill);

router.delete('/bills/:id', deleteBill);

router.get('/bills/status/:status', getBillsByStatus);

router.get('/bills/patient/:patientId', getPatientBills);

router.post('/bills/:billId/payments', recordPayment);

router.get('/insurance', getAllInsuranceClaims);

router.get('/insurance/:id', getInsuranceClaimById);

router.post('/insurance', createInsuranceClaim);

router.put('/insurance/:id', updateInsuranceClaim);

router.patch('/insurance/:id/status', updateClaimStatus);

router.delete('/insurance/:id', deleteInsuranceClaim);

router.get('/insurance/status/:status', getInsuranceClaimsByStatus);

router.get('/insurance/patient/:patientId', getPatientInsuranceClaims);

router.get('/stats/revenue', getRevenueStats);

router.get('/stats/pending', getPendingPayments);

router.get('/stats/overdue', getOverduePayments);

export default router; 