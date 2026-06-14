import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBed, FaEdit, FaUserMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI } from '../../services/api';

const AdmissionsList = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PatientAPI.getAllAdmissions();
      setAdmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      if (error.response && error.response.status !== 404) {
        setError('Failed to load admission data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const filteredAdmissions = admissions && admissions.length ? admissions.filter(admission => {
    const matchesSearch = 
      (admission.patient?.name && admission.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admission.roomNumber && admission.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admission.admittedBy?.name && admission.admittedBy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admission.diagnosis && admission.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || admission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleEditAdmission = (id) => {
    navigate(`/dashboard/patient/admission/edit/${id}`);
  };

  const handleDischargePatient = async (id) => {
    if (window.confirm('Are you sure you want to discharge this patient?')) {
      try {
        await PatientAPI.dischargePatient(id, { dischargeDate: new Date() });
        toast.success('Patient discharged successfully');
        setAdmissions(admissions.map(admission => 
          admission._id === id 
            ? { ...admission, status: 'Discharged', dischargeDate: new Date() } 
            : admission
        ));
      } catch (error) {
        console.error('Error discharging patient:', error);
        toast.error('Failed to discharge patient');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Admitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const component = (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-semibold mb-2 md:mb-0">Patient Admissions</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search admissions..."
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Admitted">Admitted</option>
            <option value="Discharged">Discharged</option>
          </select>
          <button
            onClick={() => navigate('/dashboard/patient/admission/new')}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <FaPlus />
            <span>New Admission</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchAdmissions} 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discharge Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmissions.length > 0 ? (
                filteredAdmissions.map((admission) => (
                  <tr key={admission._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{admission.patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{`${admission.roomNumber || 'N/A'}-${admission.bedNumber || 'N/A'}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{admission.admittedBy?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admission.dischargeDate ? new Date(admission.dischargeDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{admission.diagnosis || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(admission.status)}`}>
                        {admission.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          className="text-blue-600 hover:text-blue-900 cursor-pointer" 
                          title="Edit"
                          onClick={() => handleEditAdmission(admission._id)}
                        >
                          <FaEdit />
                        </button>
                        {admission.status === 'Admitted' && (
                          <button 
                            className="text-red-600 hover:text-red-900 cursor-pointer" 
                            title="Discharge Patient"
                            onClick={() => handleDischargePatient(admission._id)}
                          >
                            <FaUserMinus />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No admissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (standalone) {
    return (
      <DashboardLayout dashboardType="patient">
        {component}
      </DashboardLayout>
    );
  }

  return component;
};

export default AdmissionsList; 