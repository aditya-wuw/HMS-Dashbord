import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI, FinanceAPI } from '../../services/api';

const BillForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingBill, setLoadingBill] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const getDefaultDueDate = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    patientId: '',
    billType: 'Consultation',
    totalAmount: '0',
    paidAmount: '0',
    dueDate: getDefaultDueDate(),
    paymentStatus: 'Pending',
    items: [
      { description: '', amount: '' }
    ]
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        setError(null);
        const response = await PatientAPI.getAllPatients();
        setPatients(response.data);

      } catch (error) {
        console.error('Error fetching patients:', error);
        if (error.response && error.response.status !== 404) {
          toast.error('Error loading patients');
          setError('Failed to load patient data. Please try again later.');
        }
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchBill = async () => {
        try {
          setLoadingBill(true);
          setError(null);

          console.log(`Fetching bill with ID: ${id}`);
          const response = await FinanceAPI.getBillById(id);
          const billData = response.data;

          console.log('Received bill data:', billData);

          setFormData({
            patientId: billData.patient?._id || '',
            billType: billData.billType || 'Consultation',
            totalAmount: billData.totalAmount?.toString() || '0',
            paidAmount: billData.paidAmount?.toString() || '0',
            dueDate: billData.dueDate ? new Date(billData.dueDate).toISOString().split('T')[0] : getDefaultDueDate(),
            paymentStatus: billData.paymentStatus || 'Pending',
            items: billData.items?.length ? billData.items.map(item => ({
              description: item.description || '',
              amount: item.amount?.toString() || '0'
            })) : [{ description: '', amount: '' }]
          });

        } catch (error) {
          console.error('Error fetching bill:', error);
          toast.error('Failed to load bill data');
          setError('Failed to load bill data. Please try again later.');
        } finally {
          setLoadingBill(false);
        }
      };

      fetchBill();
    }
  }, [isEditMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'patientId') {
      console.log('Patient selected:', value);

      if (value) {
        setFormErrors(prevErrors => ({
          ...prevErrors,
          patientId: ''
        }));
        const patientExists = patients.some(patient => patient._id === value);
        if (!patientExists) {
          console.warn('Selected patient not found in patients list:', value);
          setFormErrors(prevErrors => ({
            ...prevErrors,
            patientId: 'Invalid patient selection'
          }));
        }
      } else {
        setFormErrors(prevErrors => ({
          ...prevErrors,
          patientId: 'Please select a patient'
        }));
      }
    } else if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setFormData({
      ...formData,
      items: updatedItems
    });

    if (field === 'amount') {
      const totalAmount = updatedItems.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);

      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        totalAmount: totalAmount.toFixed(2)
      }));
    }

    if (formErrors.items) {
      setFormErrors({
        ...formErrors,
        items: null
      });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: '' }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return; // Keep at least one item
    }

    const updatedItems = formData.items.filter((_, i) => i !== index);

    const totalAmount = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: totalAmount.toFixed(2)
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.patientId || formData.patientId.trim() === '') {
      errors.patientId = 'Please select a patient';
    } else {
      const patientExists = patients.some(patient => patient._id === formData.patientId);
      if (!patientExists) {
        errors.patientId = 'Invalid patient selection';
      }
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    }

    const itemsValid = formData.items.every(item =>
      item.description.trim() !== '' &&
      item.amount !== '' &&
      parseFloat(item.amount) > 0
    );

    if (!itemsValid) {
      errors.items = 'All items must have a description and valid amount';
    }

    if (parseFloat(formData.paidAmount) > parseFloat(formData.totalAmount)) {
      errors.paidAmount = 'Paid amount cannot be greater than total amount';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');

      if (formErrors.patientId) {
        toast.error(formErrors.patientId);
        document.querySelector('select[name="patientId"]')?.focus();
      }

      return;
    }

    if (!patients.some(patient => patient._id === formData.patientId)) {
      setFormErrors(prev => ({
        ...prev,
        patientId: 'Patient selection is invalid'
      }));
      toast.error('Patient selection is invalid');
      return;
    }

    try {
      setLoading(true);

      let paymentStatus = formData.paymentStatus;
      const paidAmount = parseFloat(formData.paidAmount) || 0;
      const totalAmount = parseFloat(formData.totalAmount);

      if (paidAmount === 0) {
        paymentStatus = 'Pending';
      } else if (paidAmount === totalAmount) {
        paymentStatus = 'Paid';
      } else if (paidAmount > 0 && paidAmount < totalAmount) {
        paymentStatus = 'Partial';
      }

      const billData = {
        ...formData,
        paymentStatus
      };

      console.log(`${isEditMode ? 'Updating' : 'Submitting'} bill data:`, billData);

      if (isEditMode) {
        await FinanceAPI.updateBill(id, billData);
        toast.success('Bill updated successfully!');
      } else {
        await FinanceAPI.createBill(billData);
        toast.success('Bill created successfully!');
      }

      navigate('/dashboard/admin/billing');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} bill:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} bill. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout dashboardType="admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaFileInvoiceDollar className="text-purple-500 mr-3 text-xl" />
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Update Bill' : 'Create New Bill'}</h1>
        </div>

        {(loadingPatients || loadingBill) ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Bill Information</h2>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Patient*
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.patientId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer`}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.name}
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
                    Bill Type*
                  </label>
                  <select
                    name="billType"
                    value={formData.billType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Lab Test">Lab Test</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Medication">Medication</option>
                    <option value="Room Charge">Room Charge</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Payment Information</h2>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Total Amount (₹)*
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    min="0"
                    step="0.01"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculated from items below
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.paidAmount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.paidAmount && <p className="mt-1 text-red-500 text-xs">{formErrors.paidAmount}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Due Date*
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer`}
                    required
                  />
                  {formErrors.dueDate && <p className="mt-1 text-red-500 text-xs">{formErrors.dueDate}</p>}
                </div>
              </div>
            </div>

            {/* Bill Items */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Bill Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm cursor-pointer"
                >
                  + Add Item
                </button>
              </div>

              {formErrors.items && <p className="mt-1 mb-3 text-red-500 text-xs">{formErrors.items}</p>}

              {formData.items.map((item, index) => (
                <div key={`item-${index}`} className="flex items-center space-x-4 mb-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex-grow">
                    <label className="block text-gray-700 text-xs font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-gray-700 text-xs font-medium mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mb-0.5 p-2 text-red-500 hover:text-red-700 focus:outline-none cursor-pointer"
                      disabled={formData.items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard/admin/billing')}
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
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Bill' : 'Create Bill'}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillForm; 