import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaCalendarAlt, FaBed, FaUserMd, 
  FaFileMedical, FaFileInvoiceDollar, FaChartLine, 
  FaSignOutAlt, FaUserPlus, FaClipboardList,
  FaUserCog, FaCalendarCheck
} from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { IoMdClose } from "react-icons/io";
const Sidebar = ({ dashboardType }) => {
  const location = useLocation();
  const { user, handleLogout, sideBar, setSideBar } = useAppContext();
  let navItems = [];
  
  if (dashboardType === 'patient') {
    navItems = [
      { path: '/dashboard/patient', name: 'Overview', icon: <FaHome /> },
      { path: '/dashboard/patient/records', name: 'Patient Records', icon: <FaUsers /> },
      { path: '/dashboard/patient/appointments', name: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/dashboard/patient/admissions', name: 'Admissions', icon: <FaBed /> },
      { path: '/dashboard/patient/new', name: 'Register Patient', icon: <FaUserPlus /> },
      { path: '/dashboard/patient/appointment/new', name: 'Schedule Appointment', icon: <FaClipboardList /> },
    ];
  } else if (dashboardType === 'doctor') {
    navItems = [
      { path: '/dashboard/doctor', name: 'Overview', icon: <FaHome /> },
      { path: '/dashboard/doctor/roster', name: 'Staff Roster', icon: <FaUserMd /> },
      { path: '/dashboard/doctor/attendance', name: 'Attendance', icon: <FaCalendarCheck /> },
      { path: '/dashboard/doctor/new', name: 'Add Staff', icon: <FaUserPlus /> },
    ];
  } else if (dashboardType === 'admin') {
    navItems = [
      { path: '/dashboard/admin', name: 'Overview', icon: <FaHome /> },
      { path: '/dashboard/admin/billing', name: 'Billing', icon: <FaFileInvoiceDollar /> },
      { path: '/dashboard/admin/insurance', name: 'Insurance Claims', icon: <FaFileMedical /> },
      { path: '/dashboard/admin/bills/new', name: 'Create Bill', icon: <FaFileInvoiceDollar /> },
      { path: '/dashboard/admin/insurance/new', name: 'New Insurance Claim', icon: <FaClipboardList /> },
    ];
  }

  const getDashboardTitle = () => {
    if (dashboardType === 'admin') {
      return 'Finance Dashboard';
    }
    return `${dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Dashboard`;
  };

  return (
    <div className={`bg-blue-900/10 backdrop-blur-sm a  z-10 shadow-sm w-64 min-h-screen absolute flex-shrink-0 flex flex-col ${sideBar ? 'left-0' : '-left-100'} transition-all duration-200`}>
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {getDashboardTitle()}
        </h2>
        <div className='flex items-center justify-end'>
          <IoMdClose className='text-black scale-[150%] cursor-pointer' onClick={() => setSideBar(!sideBar)} />
        </div>
      </div>
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-md ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 mt-auto bg-blue-500/20">
        {user?.role === 'admin' ? (
          <Link 
            to="/dashboard" 
            className="text-white/80 hover:text-white flex items-center bg-blue-700 p-2 rounded-md w-full"
          >
            <FaSignOutAlt className="mr-2" /> Change Dashboard
          </Link>
        ) : (
          <Link 
            to="/" 
            onClick={handleLogout}
            className="text-white/80 hover:text-white flex items-center bg-blue-700 p-2 rounded-md w-full"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 