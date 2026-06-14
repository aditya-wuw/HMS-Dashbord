import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarPlus } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI, StaffAPI } from '../../services/api';

const NewAppointmentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    purpose: '',
    notes: '',
    status: 'Scheduled',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        const [patientsRes, doctorsRes] = await Promise.all([
          PatientAPI.getAllPatients(),
          StaffAPI.getStaffByRole('Doctor')
        ]);
        
        setPatients(patientsRes.data || []);
        setDoctors(doctorsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status !== 404) {
          toast.error('Error loading doctors and patients');
          setError('Failed to load doctors and patients data. Please try again later.');
        }
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.patientId) {
      errors.patientId = 'Please select a patient';
    }
    
    if (!formData.doctorId) {
      errors.doctorId = 'Please select a doctor';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    
    if (!formData.time) {
      errors.time = 'Please select a time';
    }
    
    if (!formData.purpose.trim()) {
      errors.purpose = 'Purpose is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log("Submitting appointment:", formData);
      
      const response = await PatientAPI.createAppointment(formData);
      console.log("Appointment created:", response.data);
      
      toast.success('Appointment scheduled successfully!');
      navigate('/dashboard/patient/appointments');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      
      let errorMessage = 'Failed to schedule appointment. Please try again.';
      
      if (error.response) {
        console.log("Error response:", error.response);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = 'The appointment service is not available. Please try again later.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid appointment data. Please check your inputs and try again.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  return (
    <DashboardLayout dashboardType="patient">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaCalendarPlus className="text-blue-500 mr-3 text-xl" />
          <h1 className="text-2xl font-bold text-gray-800">Schedule New Appointment</h1>
        </div>
        
        {loadingData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Appointment Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Appointment Details</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Patient*
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.patientId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.name} ({patient.age}, {patient.gender})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No patients available</option>
                    )}
                  </select>
                  {formErrors.patientId && <p className="mt-1 text-red-500 text-xs">{formErrors.patientId}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Doctor*
                  </label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.doctorId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.length > 0 ? (
                      doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} ({doctor.department || 'General'})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No doctors available</option>
                    )}
                  </select>
                  {formErrors.doctorId && <p className="mt-1 text-red-500 text-xs">{formErrors.doctorId}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Purpose of Visit*
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.purpose ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    placeholder="e.g., Regular Check-up, Consultation, Follow-up"
                  />
                  {formErrors.purpose && <p className="mt-1 text-red-500 text-xs">{formErrors.purpose}</p>}
                </div>
              </div>
              
              {/* Schedule */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Schedule</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    required
                    min={tomorrowFormatted}
                  />
                  {formErrors.date && <p className="mt-1 text-red-500 text-xs">{formErrors.date}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Time*
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.time ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    required
                  />
                  {formErrors.time && <p className="mt-1 text-red-500 text-xs">{formErrors.time}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Notes */}
        
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard/patient/appointments')}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-4 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewAppointmentForm; 