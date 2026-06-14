import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const addUnderscoreId = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      addUnderscoreId(obj[i]);
    }
    return obj;
  }
  
  if ('id' in obj && !('_id' in obj)) {
    obj._id = obj.id;
  }
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      addUnderscoreId(obj[key]);
    }
  }
  
  return obj;
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = addUnderscoreId(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const PatientAPI = {
  getAllPatients: () => axiosInstance.get('/patients'),
  getPatientById: (id) => axiosInstance.get(`/patients/${id}`),
  createPatient: (data) => axiosInstance.post('/patients', data),
  updatePatient: (id, data) => axiosInstance.put(`/patients/${id}`, data),
  deletePatient: (id) => axiosInstance.delete(`/patients/${id}`),

  getAllAppointments: () => axiosInstance.get('/patients/appointments'),
  getAppointmentById: (id) => axiosInstance.get(`/patients/appointments/${id}`),
  getPatientAppointments: (patientId) => axiosInstance.get(`/patients/${patientId}/appointments`),
  createAppointment: (data) => axiosInstance.post('/patients/appointments', data),
  updateAppointment: (id, data) => axiosInstance.put(`/patients/appointments/${id}`, data),
  updateAppointmentStatus: (id, statusData) => axiosInstance.patch(`/patients/appointments/${id}/status`, statusData),
  deleteAppointment: (id) => axiosInstance.delete(`/patients/appointments/${id}`),

  getAllAdmissions: () => axiosInstance.get('/patients/admissions'),
  getAdmissionById: (id) => axiosInstance.get(`/patients/admissions/${id}`),
  getPatientAdmissions: (patientId) => axiosInstance.get(`/patients/${patientId}/admissions`),
  createAdmission: (data) => axiosInstance.post('/patients/admissions', data),
  updateAdmission: (id, data) => axiosInstance.put(`/patients/admissions/${id}`, data),
  dischargePatient: (id, dischargeData) => axiosInstance.patch(`/patients/admissions/${id}/discharge`, dischargeData)
};

export const StaffAPI = {
  getAllStaff: () => {
    return axiosInstance.get('/staff')
      .then(response => {
        return response;
      })
      .catch(error => {
        console.error('Staff data fetch error:', error);
        throw error;
      });
  },
  getStaffById: (id) => axiosInstance.get(`/staff/${id}`),
  getStaffByRole: (role) => axiosInstance.get(`/staff/role/${role}`),
  createStaff: (data) => axiosInstance.post('/staff', data),
  updateStaff: (id, data) => axiosInstance.put(`/staff/${id}`, data),
  deleteStaff: (id) => axiosInstance.delete(`/staff/${id}`),

  getDoctorAppointments: (doctorId) => axiosInstance.get(`/staff/${doctorId}/appointments`),

  getAllAttendance: () => axiosInstance.get('/staff/attendance'),
  getAttendanceByDate: (date) => axiosInstance.get(`/staff/attendance/date/${date}`),
  getStaffAttendance: (staffId) => axiosInstance.get(`/staff/attendance/staff/${staffId}`),
  markAttendance: (data) => axiosInstance.post('/staff/attendance', data),
  updateAttendance: (id, data) => axiosInstance.put(`/staff/attendance/${id}`, data)
};

export const FinanceAPI = {
  getAllBills: () => axiosInstance.get('/finance/bills'),
  getBillById: (id) => axiosInstance.get(`/finance/bills/${id}`),
  getBillsByPatient: (patientId) => axiosInstance.get(`/finance/bills/patient/${patientId}`),
  getBillsByStatus: (status) => axiosInstance.get(`/finance/bills/status/${status}`),
  createBill: (data) => axiosInstance.post('/finance/bills', data),
  updateBill: (id, data) => axiosInstance.put(`/finance/bills/${id}`, data),
  deleteBill: (id) => axiosInstance.delete(`/finance/bills/${id}`),

  recordPayment: (billId, paymentData) => axiosInstance.post(`/finance/bills/${billId}/payments`, paymentData),

  getAllInsuranceClaims: () => axiosInstance.get('/finance/insurance'),
  getInsuranceClaimById: (id) => axiosInstance.get(`/finance/insurance/${id}`),
  getInsuranceClaimsByStatus: (status) => axiosInstance.get(`/finance/insurance/status/${status}`),
  getPatientInsuranceClaims: (patientId) => axiosInstance.get(`/finance/insurance/patient/${patientId}`),
  createInsuranceClaim: (data) => axiosInstance.post('/finance/insurance', data),
  updateInsuranceClaim: (id, data) => axiosInstance.put(`/finance/insurance/${id}`, data),
  updateClaimStatus: (id, statusData) => axiosInstance.patch(`/finance/insurance/${id}/status`, statusData),
  deleteInsuranceClaim: (id) => axiosInstance.delete(`/finance/insurance/${id}`),

  getRevenueStats: (startDate, endDate) => axiosInstance.get('/finance/stats/revenue', {
    params: { startDate, endDate }
  }),
  getPendingPayments: () => axiosInstance.get('/finance/stats/pending'),
  getOverduePayments: () => axiosInstance.get('/finance/stats/overdue')
};

export const AuthAPI = {
  signup: (userData) => axiosInstance.post('/auth/signup', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials)
};

export default {
  PatientAPI,
  StaffAPI,
  FinanceAPI,
  AuthAPI
}; 
