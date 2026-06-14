import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaFileInvoice, FaClipboardCheck, FaExclamationTriangle, FaFileInvoiceDollar, FaFileMedical, FaSync, FaDownload } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../common/StatCard';
import BillingList from './BillingList';
import InsuranceClaimsList from './InsuranceClaimsList';
import { FinanceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAppContext } from '../../context/AppContext';

import 'jspdf-autotable';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const FinanceDashboard = ({ activeTab: initialActiveTab = 'billing' }) => {
  const navigate = useNavigate();
  const { refreshTrigger, refreshData } = useAppContext();
  const [bills, setBills] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    insuranceClaims: 0,
    overduePayments: 0
  });
  const [chartData, setChartData] = useState({
    paymentStatus: {
      labels: ['Paid', 'Partial', 'Pending', 'Overdue'],
      datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#10B981', '#6366F1', '#F59E0B', '#EF4444'], borderWidth: 1 }]
    },
    revenueTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        { label: 'Revenue', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#3B82F6' },
        { label: 'Expenses', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#F97316' }
      ]
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, claimsRes, revenueStatsRes] = await Promise.all([
        FinanceAPI.getAllBills(),
        FinanceAPI.getAllInsuranceClaims(),
        FinanceAPI.getRevenueStats()
      ]);
      
      setBills(billsRes.data || []);
      setClaims(claimsRes.data || []);
      
      const totalRevenue = billsRes.data.reduce((sum, bill) => sum + parseFloat(bill.paidAmount || 0), 0);
      const pendingPayments = billsRes.data.reduce((sum, bill) => {
        return sum + (parseFloat(bill.totalAmount || 0) - parseFloat(bill.paidAmount || 0));
      }, 0);
      const insuranceClaims = claimsRes.data.reduce((sum, claim) => sum + parseFloat(claim.claimAmount || 0), 0);
      const overduePayments = billsRes.data
        .filter(bill => bill.paymentStatus === 'Overdue')
        .reduce((sum, bill) => {
          return sum + (parseFloat(bill.totalAmount || 0) - parseFloat(bill.paidAmount || 0));
        }, 0);
      
      setStats({
        totalRevenue,
        pendingPayments,
        insuranceClaims,
        overduePayments
      });
      
      const paidCount = billsRes.data.filter(bill => bill.paymentStatus === 'Paid').length;
      const partialCount = billsRes.data.filter(bill => bill.paymentStatus === 'Partial').length;
      const pendingCount = billsRes.data.filter(bill => bill.paymentStatus === 'Pending').length;
      const overdueCount = billsRes.data.filter(bill => bill.paymentStatus === 'Overdue').length;
      
      let revenueTrendsData = { ...chartData.revenueTrends }; // Default data
      
      if (revenueStatsRes && revenueStatsRes.data) {
        const apiData = revenueStatsRes.data; 
        if (apiData.labels && apiData.datasets) {
          revenueTrendsData = {
            labels: apiData.labels,
            datasets: apiData.datasets
          };
        }
      }
      
      setChartData(prev => ({
        paymentStatus: {
          ...prev.paymentStatus,
          datasets: [{
            ...prev.paymentStatus.datasets[0],
            data: [paidCount, partialCount, pendingCount, overdueCount]
          }]
        },
        revenueTrends: revenueTrendsData
      }));
      
      if (!loading) {
        toast.info('Finance dashboard data refreshed', { 
          autoClose: 2000, 
          position: 'bottom-right',
          hideProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error fetching finance dashboard data:', error);
      toast.error('Error loading dashboard data');
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue & Expenses',
      },
    },
  };

  return (
    <DashboardLayout dashboardType="admin">
      <div className="space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">Finance Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshData}
              className="flex cursor-pointer items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </button>
            <button 
              className="flex cursor-pointer items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/dashboard/admin/bills/new')}
            >
              <FaFileInvoiceDollar />
              <span>New Bill</span>
            </button>
            <button 
              className="flex cursor-pointer items-center space-x-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
              onClick={() => navigate('/dashboard/admin/insurance/new')}
            >
              <FaFileMedical />
              <span>New Claim</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
            icon={<FaMoneyBillWave />} 
            color="blue" 
            subtitle="Current total"
          />
          <StatCard 
            title="Pending Payments" 
            value={`₹${stats.pendingPayments.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
            icon={<FaFileInvoice />} 
            color="blue" 
            subtitle="Awaiting payment"
          />
          <StatCard 
            title="Insurance Claims" 
            value={`₹${stats.insuranceClaims.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
            icon={<FaClipboardCheck />} 
            color="blue" 
            subtitle="Submitted"
          />
          <StatCard 
            title="Overdue Payments" 
            value={`₹${stats.overduePayments.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
            icon={<FaExclamationTriangle />} 
            color="blue" 
            subtitle="Past due date"
          />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
            <div className="h-64">
              <Pie data={chartData.paymentStatus} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
            <div className="h-64">
              <Bar options={barChartOptions} data={chartData.revenueTrends} />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex -mb-px">
            <button
              className={`mr-8 cursor-pointer py-4 px-1 font-medium ${
                activeTab === 'billing'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
            <button
              className={`mr-8 cursor-pointer py-4 px-1 font-medium ${
                activeTab === 'insurance'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('insurance')}
            >
              Insurance Claims
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="scrollbar-hide overflow-auto">
            {activeTab === 'billing' && <BillingList bills={bills} refreshTrigger={refreshTrigger} />}
            {activeTab === 'insurance' && <InsuranceClaimsList claims={claims} refreshTrigger={refreshTrigger} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceDashboard; 