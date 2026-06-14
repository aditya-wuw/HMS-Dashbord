import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBed } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI, StaffAPI } from '../../services/api';

const NewAdmissionForm = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingSelectData, setLoadingSelectData] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    roomNumber: '',
    bedNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatmentPlan: '',
    status: 'Admitted'
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelectData(true);
        setError(null);
        const [patientsRes, doctorsRes] = await Promise.all([
          PatientAPI.getAllPatients(),
          StaffAPI.getStaffByRole('Doctor')
        ]);
        
        setPatients(patientsRes.data || []);
        setDoctors(doctorsRes.data || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        if (error.response && error.response.status !== 404) {
          setError('Failed to load doctors and patients data. Please try again later.');
        }
      } finally {
        setLoadingSelectData(false);
      }
    };
    
    fetchSelectData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchAdmission = async () => {
        try {
          setFetchingData(true);
          const response = await PatientAPI.getAdmissionById(id);
          const admissionData = response.data;
          
          setFormData({
            patientId: admissionData.patient?._id || '',
            doctorId: admissionData.admittedBy?._id || '',
            roomNumber: admissionData.roomNumber || '',
            bedNumber: admissionData.bedNumber || '',
            admissionDate: admissionData.admissionDate ? new Date(admissionData.admissionDate).toISOString().split('T')[0] : '',
            diagnosis: admissionData.diagnosis || '',
            treatmentPlan: admissionData.treatmentPlan || '',
            status: admissionData.status || 'Admitted'
          });
        } catch (error) {
          console.error('Error fetching admission details:', error);
          toast.error('Failed to load admission information');
          navigate('/dashboard/patient/admissions');
        } finally {
          setFetchingData(false);
        }
      };

      fetchAdmission();
    }
  }, [id, isEditMode, navigate]);

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
    
    if (!formData.roomNumber.trim()) {
      errors.roomNumber = 'Room number is required';
    }
    
    if (!formData.bedNumber.trim()) {
      errors.bedNumber = 'Bed number is required';
    }
    
    if (!formData.admissionDate) {
      errors.admissionDate = 'Admission date is required';
    }
    
    if (!formData.diagnosis.trim()) {
      errors.diagnosis = 'Diagnosis is required';
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
      
      if (isEditMode) {
        await PatientAPI.updateAdmission(id, formData);
        toast.success('Admission updated successfully!');
      } else {
        await PatientAPI.createAdmission(formData);
        toast.success('Patient admitted successfully!');
      }
      navigate('/dashboard/patient/admissions');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} admission:`, error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} admission. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData || loadingSelectData) {
    return (
      <DashboardLayout dashboardType="patient">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout dashboardType="patient">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaBed className="text-blue-500 mr-3 text-xl" />
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Update Admission' : 'New Patient Admission'}
          </h1>
        </div>

        {error ? (
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
              {/* Patient & Doctor Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Patient & Doctor Information</h2>
                
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
                    Admitting Doctor*
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
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Room Number*
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${formErrors.roomNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                      placeholder="e.g., 101"
                    />
                    {formErrors.roomNumber && <p className="mt-1 text-red-500 text-xs">{formErrors.roomNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Bed Number*
                    </label>
                    <input
                      type="text"
                      name="bedNumber"
                      value={formData.bedNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${formErrors.bedNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                      placeholder="e.g., A"
                    />
                    {formErrors.bedNumber && <p className="mt-1 text-red-500 text-xs">{formErrors.bedNumber}</p>}
                  </div>
                </div>
              </div>
              
              {/* Medical Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Medical Information</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Admission Date*
                  </label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.admissionDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    required
                  />
                  {formErrors.admissionDate && <p className="mt-1 text-red-500 text-xs">{formErrors.admissionDate}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Diagnosis*
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.diagnosis ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    placeholder="e.g., Pneumonia, Fracture, etc."
                  />
                  {formErrors.diagnosis && <p className="mt-1 text-red-500 text-xs">{formErrors.diagnosis}</p>}
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
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Treatment Plan */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Treatment Plan</h2>
              <textarea
                name="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter treatment plan details..."
              ></textarea>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard/patient/admissions')}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-4 cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isEditMode ? 'Update Admission' : 'Admit Patient'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewAdmissionForm; 