import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserMd, FaCalendarCheck, FaClipboardList, FaCalendarPlus, FaSync, FaFileMedical } from 'react-icons/fa';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../common/StatCard';
import StaffList from './StaffList';
import AttendanceTracker from './AttendanceTracker';
import { StaffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAppContext } from '../../context/AppContext';

const StaffDashboard = ({ activeTab: initialActiveTab = 'staff' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshTrigger, refreshData } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    shiftsCount: 3 // Default value
  });

  useEffect(() => {
    const path = location.pathname.substring(1).split('/');
    
    if (path.length > 2) {
      const tabName = path[2];
      if (tabName === 'roster') {
        setActiveTab('staff');
      } else if (tabName === 'records') {
        setActiveTab('records');
      } else if (tabName === 'attendance') {
        setActiveTab('attendance');
      }
    }
  }, [location]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await StaffAPI.getAllStaff();
      console.log('Staff API response:', response);
      if (!response || !response.data) {
        console.warn('Invalid staff data response:', response);
        return;
      }
      const staffData = Array.isArray(response.data) ? response.data : [];
      
      setStats(prevStats => ({
        ...prevStats,
        totalStaff: staffData.length
      }));
      
      return staffData;
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast.error('Failed to load staff data');
      setStats(prevStats => ({
        ...prevStats,
        totalStaff: 0
      }));
      return [];
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await StaffAPI.getAttendanceByDate(today);
      
      const attendanceData = Array.isArray(response.data) ? response.data : [];
      
      const presentToday = attendanceData.filter(a => a.status === 'Present').length;
      
      setStats(prevStats => ({
        ...prevStats,
        presentToday: presentToday
      }));
      
      return attendanceData;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
      setStats(prevStats => ({
        ...prevStats,
        presentToday: 0
      }));
      return [];
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchStaffData();
      
      await fetchAttendanceData();
      
      if (!loading) {
        toast.info('Staff dashboard data refreshed', { 
          autoClose: 2000, 
          position: 'bottom-right',
          hideProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchDashboardData();
    }
  }, [refreshTrigger]);

  const MedicalRecords = () => (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Medical Records</h2>
      <p className="text-gray-600">
        This section will contain patient medical records, treatments, and history.
      </p>
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-800">
          Medical records will be displayed here. This is a placeholder for the actual implementation.
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout dashboardType="doctor">
      <div className="space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">Staff Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshData}
              className="flex items-center space-x-1 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/doctor/attendance/record')}
              className="flex items-center space-x-1 px-4 py-2 cursor-pointer bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              <FaCalendarPlus />
              <span>Record Attendance</span>
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
                onClick={fetchDashboardData} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard 
                title="Total Staff" 
                value={stats.totalStaff} 
                icon={<FaUserMd />} 
                color="blue" 
                subtitle="Registered staff"
              />
              <StatCard 
                title="Present Today" 
                value={stats.presentToday} 
                icon={<FaCalendarCheck />} 
                color="blue" 
                subtitle={`Out of ${stats.totalStaff} staff`}
              />
              <StatCard 
                title="Shifts" 
                value={stats.shiftsCount} 
                icon={<FaClipboardList />} 
                color="blue" 
                subtitle="Morning, Afternoon, Night"
              />
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex -mb-px">
                <button
                  className={`mr-8 py-4 px-1 font-medium ${
                    activeTab === 'staff'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  } cursor-pointer`}
                  onClick={() => {
                    setActiveTab('staff');
                    navigate('/dashboard/doctor/roster');
                  }}
                >
                  Staff Roster
                </button>
               
                <button
                  className={`mr-8 py-4 px-1 font-medium ${
                    activeTab === 'attendance'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  } cursor-pointer`}
                  onClick={() => {
                    setActiveTab('attendance');
                    navigate('/dashboard/doctor/attendance');
                  }}
                >
                  Attendance
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {activeTab === 'staff' && <StaffList />}
              {activeTab === 'attendance' && <AttendanceTracker />}
              {activeTab === 'records' && <MedicalRecords />}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard; 