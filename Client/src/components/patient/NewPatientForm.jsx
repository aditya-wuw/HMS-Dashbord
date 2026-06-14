import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUserEdit } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI } from '../../services/api';

const NewPatientForm = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingPatient, setFetchingPatient] = useState(isEditMode);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: '',
    contactNumber: '',
    email: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPatient = async () => {
        try {
          setFetchingPatient(true);
          const response = await PatientAPI.getPatientById(id);
          const patientData = response.data;
          
          const formattedData = {};
          Object.keys(patientData).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
              formattedData[key] = patientData[key] === null ? '' : patientData[key];
            }
          });

          setFormData({
            ...formData,
            ...formattedData
          });
        } catch (error) {
          console.error('Error fetching patient details:', error);
          toast.error('Failed to load patient information');
          navigate('/dashboard/patient/records');
        } finally {
          setFetchingPatient(false);
        }
      };

      fetchPatient();
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
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.age || formData.age <= 0) {
      errors.age = 'Valid age is required';
    }
    
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.contactNumber.replace(/[-()\s]/g, ''))) {
      errors.contactNumber = 'Invalid phone number format';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
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
      
      const patientData = {
        ...formData
      };
      
      if (isEditMode) {
        await PatientAPI.updatePatient(id, patientData);
        toast.success('Patient updated successfully!');
      } else {
        await PatientAPI.createPatient(patientData);
        toast.success('Patient registered successfully!');
      }
      navigate('/dashboard/patient/records');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'registering'} patient:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'register'} patient. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPatient) {
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
          {isEditMode ? (
            <FaUserEdit className="text-blue-500 mr-3 text-xl" />
          ) : (
            <FaUserPlus className="text-blue-500 mr-3 text-xl" />
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Update Patient Information' : 'Register New Patient'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {formErrors.name && <p className="mt-1 text-red-500 text-xs">{formErrors.name}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Age*
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.age ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    min="0"
                    max="120"
                  />
                  {formErrors.age && <p className="mt-1 text-red-500 text-xs">{formErrors.age}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Gender*
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            
            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Contact Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${formErrors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {formErrors.contactNumber && <p className="mt-1 text-red-500 text-xs">{formErrors.contactNumber}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.email && <p className="mt-1 text-red-500 text-xs">{formErrors.email}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Address*
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows="2"
                  required
                ></textarea>
                {formErrors.address && <p className="mt-1 text-red-500 text-xs">{formErrors.address}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Medical History */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Medical History</h2>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter any relevant medical history, allergies, or ongoing conditions..."
            ></textarea>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/patient/records')}
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
                isEditMode ? 'Update Patient' : 'Register Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewPatientForm;