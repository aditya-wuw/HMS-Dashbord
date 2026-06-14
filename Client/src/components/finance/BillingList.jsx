import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaFileInvoice, FaCreditCard, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import { FinanceAPI } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BillingList = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await FinanceAPI.getAllBills();
        setBills(response.data || []);
      } catch (error) {
        console.error('Error fetching bills:', error);
        if (error.response && error.response.status !== 404) {
          toast.error('Error loading billing data');
          setError('Failed to load billing data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBills();
  }, []);
  
  const filteredBills = bills && bills.length ? bills.filter(bill => {
    const matchesSearch = 
      (bill.patient?.name && bill.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill._id && bill._id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || bill.paymentStatus === statusFilter;
    const matchesType = typeFilter === 'all' || bill.billType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) : [];
  
  const uniqueTypes = bills && bills.length ? Array.from(new Set(bills.map(bill => bill.billType).filter(Boolean))) : [];
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleEditBill = (id) => {
    console.log(`Navigating to edit bill with ID: ${id}`);
    navigate(`/dashboard/admin/bills/${id}/edit`);
  };
  
  const handlePrintInvoice = (bill) => {
    if (!bill) return;
    
    try {
    
      const doc = new jsPDF();
      const hospitalName = 'Hospital Management System';
      const invoiceTitle = 'INVOICE';
      const date = new Date().toLocaleDateString();
      
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text(hospitalName, 105, 15, { align: 'center' });
      
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceTitle, 105, 30, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      doc.text('Rekha Hospital', 14, 50);
      doc.text('123 Medical Center Road', 14, 55);
      doc.text('Healthcare City, HC 12345', 14, 60);
      doc.text('Phone: (123) 456-7890', 14, 65);
      doc.text('Email: Rekha@hms.com', 14, 70);
      
      doc.text(`Invoice No: INV-${bill._id?.substring(0, 8) || '00000000'}`, 140, 50);
      doc.text(`Date: ${date}`, 140, 55);
      doc.text(`Bill Date: ${new Date(bill.billDate).toLocaleDateString()}`, 140, 60);
      doc.text(`Status: ${bill.paymentStatus || 'Pending'}`, 140, 65);
      
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 80, 182, 25, 'F');
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text('Patient Information', 14, 87);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Patient: ${bill.patientName || 'Unknown'}`, 14, 95);
      doc.text(`Patient ID: ${bill.patientId || 'Unknown'}`, 14, 100);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text('Bill Details', 14, 115);
      
      const billItems = [
        [bill.purpose || 'Medical Service', '1', `₹${parseFloat(bill.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`]
      ];
      
      if (bill.items && Array.isArray(bill.items)) {
        billItems.length = 0; // Clear the generic entry
        bill.items.forEach(item => {
          billItems.push([
            item.description || 'Medical Service',
            item.quantity || '1',
            `₹${parseFloat(item.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
          ]);
        });
      }
      
      autoTable(doc, {
        startY: 120,
        head: [['Description', 'Quantity', 'Amount']],
        body: billItems,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      const finalY = doc.lastAutoTable.finalY || 150;
      
      doc.setFillColor(240, 240, 240);
      doc.rect(120, finalY + 10, 76, 50, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Total Amount:', 125, finalY + 20);
      doc.text(`₹${parseFloat(bill.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 180, finalY + 20, { align: 'right' });
      
      doc.text('Amount Paid:', 125, finalY + 30);
      doc.text(`₹${parseFloat(bill.paidAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 180, finalY + 30, { align: 'right' });
      
      const balance = parseFloat(bill.totalAmount || 0) - parseFloat(bill.paidAmount || 0);
      
      doc.setTextColor(balance > 0 ? 255 : 0, 0, balance > 0 ? 0 : 0);
      doc.setFontSize(13);
      doc.text('Balance Due:', 125, finalY + 40);
      doc.text(`₹${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 180, finalY + 40, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text('Payment Instructions:', 14, finalY + 70);
      doc.text('1. Please make payment within 30 days.', 14, finalY + 80);
      doc.text('2. Payment can be made by cash, check, or online transfer.', 14, finalY + 85);
      doc.text('3. For questions regarding this invoice, contact our billing department.', 14, finalY + 90);
      
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(12);
      doc.text('Thank you for choosing Rekha Hospital', 105, finalY + 105, { align: 'center' });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text('© Hospital Management System', 105, doc.internal.pageSize.height - 5, { align: 'center' });
      }
      
      doc.save(`Invoice_${bill._id?.substring(0, 8) || '00000000'}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice PDF. Please make sure all required libraries are loaded.');
    }
  };
  
  const handleRecordPayment = async (bill) => {
    try {
      console.log('Recording payment for bill:', bill._id);
      
      const remainingBalance = bill.totalAmount - bill.paidAmount;
      console.log('Remaining balance:', remainingBalance);
      
      const payment = window.prompt(`Enter payment amount for ${bill.patient?.name}'s bill (up to ₹${remainingBalance.toFixed(2)}):`, '0');
      
      if (payment === null) {
        console.log('User cancelled payment');
        return;  // User cancelled
      }
      
      const paymentAmount = parseFloat(payment);
      console.log('Payment amount entered:', paymentAmount);
      
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast.error('Please enter a valid payment amount');
        console.error('Invalid payment amount:', payment);
        return;
      }
      
      if (paymentAmount > remainingBalance) {
        toast.error(`Payment cannot exceed the remaining balance of ₹${remainingBalance.toFixed(2)}`);
        console.error('Payment exceeds remaining balance');
        return;
      }
      
      console.log('Sending payment data to API...');
      await FinanceAPI.recordPayment(bill._id, { amount: paymentAmount });
      
      const newPaidAmount = parseFloat(bill.paidAmount) + paymentAmount;
      const newStatus = newPaidAmount >= bill.totalAmount ? 'Paid' : 'Partial';
      
      console.log('New paid amount:', newPaidAmount);
      console.log('New status:', newStatus);
      
      setBills(bills.map(b => 
        b._id === bill._id 
          ? { ...b, paidAmount: newPaidAmount, paymentStatus: newStatus } 
          : b
      ));
      
      toast.success(`Payment of ₹${paymentAmount.toFixed(2)} recorded successfully`);
    } catch (error) {
      console.error('Error recording payment:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to record payment. Please try again.');
      }
    }
  };
  
  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        console.log(`Deleting bill with ID: ${id}`);
        const response = await FinanceAPI.deleteBill(id);
        console.log('Delete response:', response);
        
        setBills(bills.filter(bill => bill._id !== id));
        toast.success('Bill deleted successfully');
      } catch (error) {
        console.error('Error deleting bill:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          toast.error(error.response.data.message || 'Failed to delete bill');
        } else {
          toast.error('Failed to delete bill');
        }
      }
    }
  };
  
  const component = (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-semibold mb-2 md:mb-0">Billing Overview</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bills..."
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
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select
            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/dashboard/admin/bills/new')}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <FaPlus />
            <span>Create Bill</span>
          </button>
        </div>
      </div>
      
      {loading ? (
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{bill._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bill.patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bill.billType || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(bill.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(bill.paidAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(bill.paymentStatus)}`}>
                        {bill.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button 
                          className="text-green-600 hover:text-green-900 cursor-pointer" 
                          title="Edit"
                          onClick={() => handleEditBill(bill._id)}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-900 cursor-pointer" 
                          title="Print Invoice"
                          onClick={() => handlePrintInvoice(bill)}
                        >
                          <FaFileInvoice size={16} />
                        </button>
                        <button 
                          className={`${bill.paymentStatus === 'Paid' ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-900 cursor-pointer'}`} 
                          title="Record Payment"
                          disabled={bill.paymentStatus === 'Paid'}
                          onClick={() => bill.paymentStatus !== 'Paid' && handleRecordPayment(bill)}
                        >
                          <FaCreditCard size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 cursor-pointer" 
                          title="Delete"
                          onClick={() => handleDeleteBill(bill._id)}
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
                    No bills found
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

export default BillingList; 