import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCalendarPlus, FaUserInjured, FaCalendarAlt, FaBed, FaVial, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../common/StatCard';
import PatientList from './PatientList';
import AppointmentList from './AppointmentList';
import AdmissionsList from './AdmissionsList';
import AppointmentCalendar from '../common/AppointmentCalendar';
import { PatientAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const PatientDashboard = ({ activeTab: initialActiveTab = 'patients' }) => {
  const navigate = useNavigate();
  const { refreshTrigger, refreshData } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalAdmissions: 0,
    totalResults: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsRes, appointmentsRes, admissionsRes] = await Promise.all([
        PatientAPI.getAllPatients(),
        PatientAPI.getAllAppointments(),
        PatientAPI.getAllAdmissions()
      ]);
      
      setAppointments(appointmentsRes.data || []);
      
      setStats({
        totalPatients: patientsRes.data ? patientsRes.data.length : 0,
        totalAppointments: appointmentsRes.data ? appointmentsRes.data.length : 0,
        totalAdmissions: admissionsRes.data ? admissionsRes.data.length : 0,
        totalResults: patientsRes.data ? patientsRes.data.length+1 : 0,
      });
      
      if (!loading) {
        toast.info('Dashboard data refreshed', { 
          autoClose: 2000, 
          position: 'bottom-right',
          hideProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.status !== 404) {
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchData();
    }
  }, [refreshTrigger]);

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return <PatientList refreshTrigger={refreshTrigger} />;
      case 'appointments':
        return <AppointmentList refreshTrigger={refreshTrigger} />;
      case 'admissions':
        return <AdmissionsList refreshTrigger={refreshTrigger} />;
      case 'calendar':
        return <AppointmentCalendar appointments={appointments} />;
      default:
        return <PatientList refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <DashboardLayout dashboardType="patient">
      <div className="space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">Patient Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshData}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer mr-2"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/patient/new')}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer mr-2"
            >
              <FaUserPlus />
              <span>New Patient</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/patient/appointment/new')}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors cursor-pointer mr-2"
            >
              <FaCalendarPlus />
              <span>New Appointment</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/patient/admission/new')}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors cursor-pointer"
            >
              <FaBed />
              <span>New Admission</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchData} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Patients" 
                value={stats.totalPatients} 
                icon={<FaUserInjured />} 
                color="blue" 
                subtitle="Registered in system" 
              />
              <StatCard 
                title="Appointments" 
                value={stats.totalAppointments} 
                icon={<FaCalendarAlt />} 
                color="blue" 
                subtitle="Scheduled" 
              />
              <StatCard 
                title="Current Admissions" 
                value={stats.totalAdmissions} 
                icon={<FaBed />} 
                color="blue" 
                subtitle="Inpatients" 
              />
              <StatCard 
                title="Test Results" 
                value={stats.totalResults} 
                icon={<FaVial />} 
                color="blue" 
                subtitle="Available" 
              />
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-4 overflow-x-auto scrollbar-hide">
              <nav className="flex -mb-px">
                <button
                  className={`mr-8 py-4 px-1 cursor-pointer font-medium ${
                    activeTab === 'patients'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('patients')}
                >
                  Patients
                </button>
                <button
                  className={`mr-8 py-4 px-1 cursor-pointer font-medium ${
                    activeTab === 'appointments'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Appointments
                </button>
                <button
                  className={`mr-8 py-4 px-1 cursor-pointer font-medium ${
                    activeTab === 'admissions'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('admissions')}
                >
                  Admissions
                </button>
                <button
                  className={`mr-8 py-4 px-1 cursor-pointer font-medium ${
                    activeTab === 'calendar'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('calendar')}
                >
                  Calendar
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="scrollbar-hide overflow-auto">
                {renderContent()}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard; 