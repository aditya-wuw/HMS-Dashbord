import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaFileAlt, FaCheckCircle, FaTimesCircle, FaPlus, FaTrash, FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import { FinanceAPI } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingSpinner from '../common/LoadingSpinner';

const InsuranceClaimsList = ({ standalone = false, claims: propClaims, refreshTrigger }) => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState(propClaims || []);
  const [loading, setLoading] = useState(!propClaims);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    if (propClaims && propClaims.length > 0) {
      setClaims(propClaims);
      setLoading(false);
    } else {
      fetchClaims();
    }
  }, [propClaims, refreshTrigger]);
  
  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await FinanceAPI.getAllInsuranceClaims();
      setClaims(response.data || []);
    } catch (error) {
      console.error('Error fetching insurance claims:', error);
      if (error.response && error.response.status !== 404) {
        toast.error('Error loading insurance claims data');
        setError('Failed to load insurance claims data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const filteredClaims = claims && claims.length ? claims.filter(claim => {
    const matchesSearch = 
      (claim.patient?.name && claim.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim.insuranceProvider && claim.insuranceProvider.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim._id && claim._id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'In Process':
        return 'bg-blue-100 text-blue-800';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Partially Approved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleEditClaim = (id) => {
    console.log(`Navigating to edit insurance claim with ID: ${id}`);
    navigate(`/dashboard/admin/insurance/${id}/edit`);
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      console.log(`Updating claim ${id} to status: ${newStatus}`);
      
      const promptValue = newStatus === 'Approved' ? 
        window.prompt('Enter approved amount (leave empty to approve full amount):') : null;
      
      let approvedAmount = null;
      
      if (newStatus === 'Approved') {
        if (promptValue === null) {
          console.log('User cancelled approval prompt');
          return; // User cancelled
        }
        
        if (promptValue.trim() !== '') {
          approvedAmount = parseFloat(promptValue);
          if (isNaN(approvedAmount) || approvedAmount < 0) {
            toast.error('Please enter a valid amount');
            console.error('Invalid amount entered:', promptValue);
            return;
          }
        }
      }
      
      const updateData = { 
        status: newStatus
      };
      
      if (approvedAmount !== null) {
        updateData.approvedAmount = approvedAmount;
      }
      
      console.log('Sending update data:', updateData);
      await FinanceAPI.updateClaimStatus(id, updateData);
      
      setClaims(claims.map(claim => 
        claim._id === id 
          ? { ...claim, status: newStatus, approvedAmount: approvedAmount !== null ? approvedAmount : claim.approvedAmount } 
          : claim
      ));
      
      toast.success(`Claim status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast.error(error.response?.data?.message || 'Failed to update claim status');
    }
  };
  
  const handleDeleteClaim = async (id) => {
    if (window.confirm('Are you sure you want to delete this insurance claim?')) {
      try {
        console.log(`Deleting insurance claim with ID: ${id}`);
        const response = await FinanceAPI.deleteInsuranceClaim(id);
        console.log('Delete response:', response);
        
        setClaims(claims.filter(claim => claim._id !== id));
        toast.success('Insurance claim deleted successfully');
      } catch (error) {
        console.error('Error deleting insurance claim:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          toast.error(error.response.data.message || 'Failed to delete insurance claim');
        } else {
          toast.error('Failed to delete insurance claim');
        }
      }
    }
  };
  
  const handleGenerateClaimPDF = (claim) => {
    if (!claim) return;
    
    try {
      
      const doc = new jsPDF();
      const hospitalName = 'Hospital Management System';
      const documentTitle = 'INSURANCE CLAIM';
      const date = new Date().toLocaleDateString();
      
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text(hospitalName, 105, 15, { align: 'center' });
      
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text(documentTitle, 105, 30, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      doc.text('Rekha Hospital', 14, 50);
      doc.text('123 Medical Center Road', 14, 55);
      doc.text('Healthcare City, HC 12345', 14, 60);
      doc.text('Phone: (123) 456-7890', 14, 65);
      doc.text('Email: Rekha@hms.com', 14, 70);
      
      doc.text(`Claim ID: #${claim._id?.substring(0, 8) || '00000000'}`, 140, 50);
      doc.text(`Date: ${date}`, 140, 55);
      doc.text(`Submission Date: ${new Date(claim.submissionDate || Date.now()).toLocaleDateString()}`, 140, 60);
      doc.text(`Status: ${claim.status || 'Submitted'}`, 140, 65);
      
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 80, 182, 25, 'F');
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text('Patient Information', 14, 87);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      const patientName = claim.patient?.name || 'Unknown';
      doc.text(`Patient: ${patientName}`, 14, 95);
      doc.text(`Patient ID: ${claim.patient?._id || 'Unknown'}`, 14, 100);
      
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 110, 182, 30, 'F');
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text('Insurance Information', 14, 117);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Insurance Provider: ${claim.insuranceProvider || 'Unknown'}`, 14, 125);
      doc.text(`Policy Number: ${claim.policyNumber || 'N/A'}`, 14, 130);
      doc.text(`Insurance Contact: ${claim.insuranceContact || 'N/A'}`, 120, 125);
      doc.text(`Group Number: ${claim.groupNumber || 'N/A'}`, 120, 130);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text('Claim Details', 14, 150);
      
      const claimItems = [
        ['Treatment/Service', claim.serviceDescription || 'Medical Service'],
        ['Diagnosis Code', claim.diagnosisCode || 'N/A'],
        ['Treatment Date', new Date(claim.treatmentDate || Date.now()).toLocaleDateString()],
        ['Treatment Provider', claim.treatmentProvider || 'Hospital Staff'],
        ['Claim Amount', `₹${parseFloat(claim.claimAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`]
      ];
      
      if (claim.status === 'Approved' || claim.status === 'Partially Approved') {
        claimItems.push(['Approved Amount', `₹${parseFloat(claim.approvedAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`]);
      }
      
      autoTable(doc, {
        startY: 155,
        head: [['Item', 'Details']],
        body: claimItems,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      const finalY = doc.lastAutoTable.finalY || 200;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text('Current Status', 14, finalY + 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      let statusColor;
      switch (claim.status) {
        case 'Approved':
          statusColor = [0, 128, 0]; // Green
          break;
        case 'Rejected':
          statusColor = [255, 0, 0]; // Red
          break;
        case 'Partially Approved':
          statusColor = [128, 0, 128]; // Purple
          break;
        case 'In Process':
          statusColor = [0, 0, 255]; // Blue
          break;
        default:
          statusColor = [0, 0, 0]; // Black
      }
      
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFontSize(14);
      doc.text(`Status: ${claim.status || 'Submitted'}`, 14, finalY + 30);
      
      if (claim.comments) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Comments:', 14, finalY + 40);
        
        const splitComments = doc.splitTextToSize(claim.comments, 180);
        doc.text(splitComments, 14, finalY + 50);
      }
      
      const declarationY = claim.comments ? finalY + 70 : finalY + 50;
      doc.setFillColor(240, 240, 240);
      doc.rect(14, declarationY, 182, 30, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('Declaration', 14, declarationY + 10);
      doc.setFontSize(10);
      const declaration = 'I hereby certify that the information provided in this claim is true and accurate to the best of my knowledge. I authorize the release of any medical or other information necessary to process this claim.';
      const splitDeclaration = doc.splitTextToSize(declaration, 170);
      doc.text(splitDeclaration, 14, declarationY + 20);
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text('© Rekha Hospital', 105, doc.internal.pageSize.height - 5, { align: 'center' });
      }
      
      doc.save(`Insurance_Claim_${claim._id?.substring(0, 8) || '00000000'}.pdf`);
      
      toast.success('Claim document downloaded successfully!');
    } catch (error) {
      console.error('Error generating claim document:', error);
      toast.error('Failed to generate claim document PDF. Please try again.');
    }
  };
  
  const component = (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-semibold mb-2 md:mb-0">Insurance Claims</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search claims..."
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
            <option value="Submitted">Submitted</option>
            <option value="In Process">In Process</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Partially Approved">Partially Approved</option>
          </select>
          <button
            onClick={() => navigate('/dashboard/admin/insurance/new')}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <FaPlus />
            <span>New Claim</span>
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Total Claims</div>
          <div className="text-2xl font-bold">{claims.length}</div>
        </div>
        <div className="bg-white p-4 rounded border border-green-200">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {claims.filter(c => c.status === 'Approved').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-blue-200">
          <div className="text-sm text-gray-500">In Process</div>
          <div className="text-2xl font-bold text-blue-600">
            {claims.filter(c => c.status === 'In Process' || c.status === 'Submitted').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-red-200">
          <div className="text-sm text-gray-500">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {claims.filter(c => c.status === 'Rejected').length}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr key={claim._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{claim._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.insuranceProvider || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(claim.claimAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.submissionDate ? new Date(claim.submissionDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(claim.status)}`}>
                        {claim.status || 'Submitted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          className="text-green-600 hover:text-green-900 cursor-pointer"
                          title="Edit"
                          onClick={() => handleEditClaim(claim._id)}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          title="Generate Claim PDF"
                          onClick={() => handleGenerateClaimPDF(claim)}
                        >
                          <FaFilePdf size={16} />
                        </button>
                        {(claim.status === 'In Process' || claim.status === 'Submitted') && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                              title="Mark as Approved"
                              onClick={() => handleUpdateStatus(claim._id, 'Approved')}
                            >
                              <FaCheckCircle size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Mark as Rejected"
                              onClick={() => handleUpdateStatus(claim._id, 'Rejected')}
                            >
                              <FaTimesCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          title="Delete"
                          onClick={() => handleDeleteClaim(claim._id)}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No insurance claims found
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
      <DashboardLayout dashboardType="admin">
        {component}
      </DashboardLayout>
    );
  }

  return component;
};

export default InsuranceClaimsList; 