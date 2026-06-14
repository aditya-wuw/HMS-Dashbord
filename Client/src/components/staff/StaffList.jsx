import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch, FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import { StaffAPI } from '../../services/api';

const StaffList = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [error, setError] = useState(null);
  
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaffAPI.getAllStaff();
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      if (error.response && error.response.status !== 404) {
        toast.error('Error loading staff members');
        setError('Failed to load staff data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff && staff.length ? staff.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      (member.contactNumber && member.contactNumber.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  }) : [];
  
  const uniqueRoles = staff && staff.length ? Array.from(new Set(staff.map(member => member.role).filter(Boolean))) : [];
  const uniqueDepartments = staff && staff.length ? Array.from(new Set(staff.map(member => member.department).filter(Boolean))) : [];
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await StaffAPI.deleteStaff(id);
        toast.success('Staff member deleted successfully');
        setStaff(staff.filter(member => member._id !== id));
      } catch (error) {
        console.error('Error deleting staff member:', error);
        toast.error('Failed to delete staff member');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/doctor/edit/${id}`);
  };

  const component = (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-semibold mb-2 md:mb-0">Staff Roster</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search staff..."
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map(department => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/dashboard/doctor/new')}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <FaUserPlus />
            <span>Add Staff</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p>{error}</p>
            <button 
              onClick={fetchStaff} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{member.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.role || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.department || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.contactNumber || member.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                  
                        <button 
                          className="text-green-600 hover:text-green-900 cursor-pointer" 
                          title="Edit"
                          onClick={() => handleEdit(member._id)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 cursor-pointer" 
                          title="Delete"
                          onClick={() => handleDelete(member._id)}
                        >
                          <FaTrash />
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No staff members found
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
      <DashboardLayout dashboardType="doctor">
        {component}
      </DashboardLayout>
    );
  }

  return component;
};

export default StaffList; 