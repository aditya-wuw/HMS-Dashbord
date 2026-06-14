import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileAlt, FaPlus, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI, FinanceAPI } from '../../services/api';

const InsuranceClaimForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get claim ID from URL if in edit mode
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingBills, setLoadingBills] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(isEditMode);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    billId: '',
    insuranceProvider: '',
    policyNumber: '',
    claimAmount: '',
    submissionDate: new Date().toISOString().split('T')[0],
    status: 'Submitted',
    diagnosisCodes: [''],
    procedureCodes: [''],
    documents: [''],
    notes: ''
  });

  const insuranceProviders = [
    'Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 
    'Cigna', 'Humana', 'Kaiser Permanente', 'Medicare', 
    'Medicaid', 'Anthem', 'MetLife', 'Other'
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await PatientAPI.getAllPatients();
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Error loading patients');
      } finally {
        setLoadingPatients(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  useEffect(() => {
    if (isEditMode) {
      const fetchClaim = async () => {
        try {
          setLoadingClaim(true);
          console.log(`Fetching insurance claim with ID: ${id}`);
          const response = await FinanceAPI.getInsuranceClaimById(id);
          const claimData = response.data;
          
          console.log('Received insurance claim data:', claimData);
          
          setFormData(prevData => ({
            ...prevData,
            patientId: claimData.patient?._id || ''
          }));
          
          setTimeout(() => {
            setFormData({
              patientId: claimData.patient?._id || '',
              billId: claimData.bill?._id || '',
              insuranceProvider: claimData.insuranceProvider || '',
              policyNumber: claimData.policyNumber || '',
              claimAmount: claimData.claimAmount?.toString() || '',
              submissionDate: claimData.submissionDate ? new Date(claimData.submissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: claimData.status || 'Submitted',
              diagnosisCodes: claimData.diagnosisCodes?.length ? claimData.diagnosisCodes : [''],
              procedureCodes: claimData.procedureCodes?.length ? claimData.procedureCodes : [''],
              documents: claimData.documents?.length ? claimData.documents : [''],
              notes: claimData.notes || ''
            });
          }, 500); // Short delay to ensure bills are loaded
          
        } catch (error) {
          console.error('Error fetching insurance claim:', error);
          toast.error('Failed to load insurance claim data');
          setError('Failed to load claim data. Please try again later.');
        } finally {
          setLoadingClaim(false);
        }
      };
      
      fetchClaim();
    }
  }, [isEditMode, id]);
  
  useEffect(() => {
    const fetchBills = async () => {
      if (!formData.patientId) {
        setBills([]);
        return;
      }
      
      try {
        setLoadingBills(true);
        console.log(`Fetching bills for patient ID: ${formData.patientId}`);
        const response = await FinanceAPI.getBillsByPatient(formData.patientId);
        setBills(response.data || []);
        
        if (!response.data || response.data.length === 0) {
          toast.warning('No bills found for this patient');
        }
      } catch (error) {
        console.error('Error fetching bills:', error);
        toast.error('Error loading bills for patient');
        setBills([]);
      } finally {
        setLoadingBills(false);
      }
    };
    
    fetchBills();
  }, [formData.patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'billId' && value) {
      const selectedBill = bills.find(bill => bill._id === value);
      if (selectedBill) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          claimAmount: selectedBill.totalAmount
        }));
      }
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length === 1) {
      return; // Keep at least one item
    }
    
    const newArray = formData[field].filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.billId || !formData.insuranceProvider || !formData.claimAmount) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const claimData = {
        ...formData,
      };
      
      console.log(`${isEditMode ? 'Updating' : 'Submitting'} claim data:`, claimData);
      
      if (isEditMode) {
        await FinanceAPI.updateInsuranceClaim(id, claimData);
        toast.success('Insurance claim updated successfully!');
      } else {
        await FinanceAPI.createInsuranceClaim(claimData);
        toast.success('Insurance claim submitted successfully!');
      }
      
      navigate('/dashboard/admin/insurance');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} claim:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'submit'} insurance claim. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout dashboardType="admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaFileAlt className="text-purple-500 mr-3 text-xl" />
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Update Insurance Claim' : 'Submit New Insurance Claim'}</h1>
        </div>
        
        {(loadingPatients || loadingClaim) ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
              {/* Patient & Insurance Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Patient & Insurance Information</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Patient*
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={isEditMode} // Disable in edit mode to prevent cascading changes
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                  {isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Patient cannot be changed when updating a claim.
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bill to Claim*
                  </label>
                  <select
                    name="billId"
                    value={formData.billId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={loadingBills || !formData.patientId || isEditMode}
                  >
                    <option value="">Select Bill</option>
                    {bills.length > 0 ? (
                      bills.map(bill => (
                        <option key={bill._id} value={bill._id}>
                          {bill.billType} - ₹{bill.totalAmount} ({bill.paymentStatus})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>{formData.patientId ? 'No bills available for this patient' : 'Select a patient first'}</option>
                    )}
                  </select>
                  {loadingBills && <p className="mt-1 text-gray-500 text-xs">Loading bills...</p>}
                  {isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Bill cannot be changed when updating a claim.
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Insurance Provider*
                  </label>
                  <select
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Provider</option>
                    {insuranceProviders.map(provider => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Policy Number*
                  </label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              
              {/* Claim Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Claim Details</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Claim Amount (₹)*
                  </label>
                  <input
                    type="number"
                    name="claimAmount"
                    value={formData.claimAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    min="0"
                    step="0.01"
                  />
                  {formData.billId && !isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-filled from bill amount. You can adjust if needed.
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    name="submissionDate"
                    value={formData.submissionDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="In Process">In Process</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Partially Approved">Partially Approved</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Diagnosis & Procedure Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Diagnosis Codes */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">Diagnosis Codes</h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem('diagnosisCodes')}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                  >
                    <FaPlus className="inline mr-1" size={12} /> Add Code
                  </button>
                </div>
                
                {formData.diagnosisCodes.map((code, index) => (
                  <div key={`diagnosis-${index}`} className="flex mb-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => handleArrayChange('diagnosisCodes', index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., ICD-10 code"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('diagnosisCodes', index)}
                      className="ml-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                      disabled={formData.diagnosisCodes.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Procedure Codes */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">Procedure Codes</h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem('procedureCodes')}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                  >
                    <FaPlus className="inline mr-1" size={12} /> Add Code
                  </button>
                </div>
                
                {formData.procedureCodes.map((code, index) => (
                  <div key={`procedure-${index}`} className="flex mb-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => handleArrayChange('procedureCodes', index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., CPT code"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('procedureCodes', index)}
                      className="ml-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                      disabled={formData.procedureCodes.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Supporting Documents */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Supporting Documents</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('documents')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                >
                  <FaPlus className="inline mr-1" size={12} /> Add Document
                </button>
              </div>
              
              {formData.documents.map((doc, index) => (
                <div key={`doc-${index}`} className="flex mb-3">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => handleArrayChange('documents', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Document description/URL"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('documents', index)}
                    className="ml-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                    disabled={formData.documents.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Notes */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Additional Notes</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
                placeholder="Any additional information about this claim..."
              ></textarea>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/admin/insurance')}
                className="px-6 py-2 cursor-pointer bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Claim' : 'Submit Claim'}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InsuranceClaimForm; 