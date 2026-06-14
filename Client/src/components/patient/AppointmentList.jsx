import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarTimes, FaCheck, FaCalendarPlus, FaUserTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import { PatientAPI } from '../../services/api';
import AppointmentCalendar from '../common/AppointmentCalendar';
const AppointmentList = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PatientAPI.getAllAppointments();
      console.log('Fetched appointments:', response.data);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response && error.response.status !== 404) {
        setError('Failed to load appointment data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments && appointments.length ? appointments.filter(appointment => {
    const matchesSearch = 
      (appointment.patient?.name && appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.doctor?.name && appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.purpose && appointment.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(appointmentId);
      console.log(`Updating appointment ${appointmentId} status to ${newStatus}`);
      
      const response = await PatientAPI.updateAppointmentStatus(appointmentId, { status: newStatus });
      console.log('Status update response:', response);
      
      setAppointments(appointments.map(appointment => 
        appointment._id === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      ));
      
      const statusMessages = {
        'Scheduled': 'Appointment has been rescheduled',
        'Completed': 'Appointment marked as completed',
        'Cancelled': 'Appointment has been cancelled',
        'No-Show': 'Patient marked as no-show'
      };
      
      toast.success(statusMessages[newStatus] || `Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      let errorMessage = 'Failed to update appointment status';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-green-500/50 text-green-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No-Show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const component = (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-semibold mb-2 md:mb-0">Appointments</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
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
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-Show">No-Show</option>
          </select>
          <button
            onClick={() => navigate('/dashboard/patient/appointment/new')}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <FaCalendarPlus />
            <span>New Appointment</span>
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
              onClick={fetchAppointments} 
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{appointment.patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appointment.doctor?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{appointment.time || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appointment.purpose || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        {(appointment.status === 'Scheduled' || appointment.status === 'Confirmed') && (
                          <>
                            <button 
                              className="text-red-600 hover:text-red-900 cursor-pointer" 
                              title="Cancel Appointment"
                              onClick={() => handleStatusChange(appointment._id, 'Cancelled')}
                              disabled={updatingStatus === appointment._id}
                            >
                              <FaCalendarTimes />
                            </button>
                            <button 
                              className="text-yellow-600 hover:text-yellow-900 cursor-pointer" 
                              title="Mark as No-Show"
                              onClick={() => handleStatusChange(appointment._id, 'No-Show')}
                              disabled={updatingStatus === appointment._id}
                            >
                              <FaUserTimes />
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-900 cursor-pointer" 
                              title="Mark as Completed"
                              onClick={() => handleStatusChange(appointment._id, 'Completed')}
                              disabled={updatingStatus === appointment._id}
                            >
                              <FaCheck />
                            </button>
                          </>
                        )}
                        {(appointment.status === 'Cancelled' || appointment.status === 'No-Show') && (
                          <button 
                            className="text-blue-600 hover:text-blue-900 cursor-pointer" 
                            title="Reschedule (Mark as Scheduled)"
                            onClick={() => handleStatusChange(appointment._id, 'Scheduled')}
                            disabled={updatingStatus === appointment._id}
                          >
                            <FaCalendarPlus />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No appointments found
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

export default AppointmentList; 