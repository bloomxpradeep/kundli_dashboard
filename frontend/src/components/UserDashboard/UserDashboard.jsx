import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import OverviewTab from './Overview/OverviewTab';
import OrdersTab from './Orders/OrdersTab';
import AnalyticsTab from './Analytics/AnalyticsTab';
import CreditsTab from './Credits/CreditsTab';
import ProfileModal from './Profile/ProfileModal';
import OrderDetailsModal from './Orders/OrderDetailsModal';
import CreditPurchaseModal from './Credits/CreditPurchaseModal';

export default function UserDashboard({ user, profile: initialProfile, onLogout, addToast }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'analytics' | 'credits'
  const [profile, setProfile] = useState(initialProfile || null);
  const [companySettings, setCompanySettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [kundliOrders, setKundliOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreditPurchaseModalOpen, setIsCreditPurchaseModalOpen] = useState(false);
  const [purchaseCreditAmount, setPurchaseCreditAmount] = useState('10');
  const [selectedPackage, setSelectedPackage] = useState('Starter');
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const creditPackages = [
    { id: 'Starter', credits: 10, price: 10, popular: false },
    { id: 'Popular', credits: 50, price: 50, popular: true },
    { id: 'Pro', credits: 100, price: 100, popular: false }
  ];
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      const container = document.getElementById('user-menu-container');
      if (container && !container.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, dateFilter, customStartDate, customEndDate, statusFilter]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const dashboardRes = await fetch(`${import.meta.env.VITE_API_URL}/user/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (dashboardRes.status === 401) {
        addToast('Session expired. Please log in again.', 'error');
        onLogout();
        return;
      }

      if (!dashboardRes.ok) throw new Error('Failed to fetch user data');
      
      const dashboardData = await dashboardRes.json();

      if (!profile) {
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }
      }
      setTransactions(dashboardData.transactions || []);
      setCompanySettings(dashboardData.companySettings || null);
      setKundliOrders(dashboardData.orders || []);
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
      addToast('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Razorpay Payment & Credit Allocation Flow ---
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCredits = async (e) => {
    e.preventDefault();
    const amount = parseInt(purchaseCreditAmount);
    if (!amount || amount <= 0) return;
    
    setIsProcessingPayment(true);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        addToast('Razorpay SDK failed to load. Please check your connection.', 'error');
        setIsProcessingPayment(false);
        return;
      }
      
      const token = localStorage.getItem('auth_token');

      // 1. Ask backend to create a Razorpay order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (!orderResponse.ok) throw new Error('Failed to create Razorpay order');
      const orderData = await orderResponse.json();

      // 2. Open Razorpay Checkout overlay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount, 
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'Kundli Portal',
        description: `Purchase of ${amount} Credits`,
        handler: async function (response) {
          try {
            // 3. Send signature to backend for secure verification
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                credits: amount
              })
            });

            const data = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(data.error || 'Failed to process transaction securely');
            }

            // Update local state instantly based on backend calculation
            setCompanySettings(prev => ({ ...prev, total_credits: data.newTotal }));
            addToast(`Successfully purchased ${amount} credits!`, 'success');
            setIsCreditPurchaseModalOpen(false);
            setPurchaseCreditAmount('');
            setSelectedPackage('');
            fetchUserData(); // Refresh logs
            
          } catch (err) {
            console.error("Payment verification failed:", err);
            addToast(err.message || 'Payment successful, but failed to log transaction. Contact Admin.', 'error');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          email: user?.email || '',
          name: user?.full_name || '',
          contact: '9999999999' // Dummy contact so Razorpay doesn't ask for it
        },
        theme: {
          color: '#800000' // Maroon theme
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (err) {
      console.error(err);
      addToast('An error occurred initializing the payment gateway.', 'error');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-bg-base">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        showDropdown={showDropdown} 
        setShowDropdown={setShowDropdown} 
        setIsProfileModalOpen={setIsProfileModalOpen} 
        onLogout={onLogout} 
        profile={profile} 
        user={user} 
      />

      <main className="flex-grow ml-64 p-8 md:p-10 flex flex-col gap-8 min-w-0">
        <header>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            {activeTab === 'overview' && 'Overview'}
            {activeTab === 'orders' && 'Orders'}
            {activeTab === 'analytics' && 'Order Analysis'}
            {activeTab === 'credits' && 'Credit Usage & Logs'}
          </h1>
          <p className="text-xs text-text-muted mt-1 font-normal">
            {activeTab === 'overview' && 'Overview of company credit balance and astrology report options.'}
            {activeTab === 'orders' && 'All customer orders with insights, filters and pagination.'}
            {activeTab === 'analytics' && 'Visual analysis and demographics of customer orders.'}
            {activeTab === 'credits' && 'Track your credit purchases, allocations, and how much credit you have used.'}
          </p>
        </header>

        {activeTab === 'overview' && (
          <OverviewTab 
            loading={loading}
            companySettings={companySettings}
            kundliOrders={kundliOrders}
            setIsCreditPurchaseModalOpen={setIsCreditPurchaseModalOpen}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            loading={loading}
            kundliOrders={kundliOrders}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            PAGE_SIZE={PAGE_SIZE}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab 
            loading={loading}
            kundliOrders={kundliOrders}
          />
        )}

        {activeTab === 'credits' && (
          <CreditsTab 
            companySettings={companySettings}
            transactions={transactions}
            setIsCreditPurchaseModalOpen={setIsCreditPurchaseModalOpen}
          />
        )}
      </main>

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        user={user}
      />

      <OrderDetailsModal 
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        addToast={addToast}
      />

      <CreditPurchaseModal 
        isCreditPurchaseModalOpen={isCreditPurchaseModalOpen}
        setIsCreditPurchaseModalOpen={setIsCreditPurchaseModalOpen}
        isProcessingPayment={isProcessingPayment}
        handleBuyCredits={handleBuyCredits}
        creditPackages={creditPackages}
        selectedPackage={selectedPackage}
        setSelectedPackage={setSelectedPackage}
        isCustomAmount={isCustomAmount}
        setIsCustomAmount={setIsCustomAmount}
        purchaseCreditAmount={purchaseCreditAmount}
        setPurchaseCreditAmount={setPurchaseCreditAmount}
      />
    </div>
  );
}
