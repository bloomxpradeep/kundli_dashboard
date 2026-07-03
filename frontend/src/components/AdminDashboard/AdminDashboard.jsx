import React, { useState, useEffect } from 'react';
import { Coins, UserPlus } from 'lucide-react';

import Sidebar from './Sidebar/Sidebar';
import OverviewTab from './Overview/OverviewTab';
import AllocateCreditModal from './Overview/AllocateCreditModal';
import UsersTab from './Users/UsersTab';
import CreateUserModal from './Users/CreateUserModal';
import OrdersTab from './Orders/OrdersTab';
import TransactionsTab from './Transactions/TransactionsTab';
import EditUserModal from './Users/EditUserModal';
import OrderDetailsModal from '../UserDashboard/Orders/OrderDetailsModal';

export default function AdminDashboard({ onLogout, addToast, profile }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'orders' | 'transactions'
  const [users, setUsers] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [kundliOrders, setKundliOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form inputs
  const [newFullName, setNewFullName] = useState('');
  const [newLoginUsername, setNewLoginUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [editFullName, setEditFullName] = useState('');
  const [editLoginUsername, setEditLoginUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const [targetUserId, setTargetUserId] = useState('');
  const [creditAmount, setCreditAmount] = useState('10');
  const [allocationReason, setAllocationReason] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [submittingCredit, setSubmittingCredit] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        addToast('Session expired. Please log in again.', 'error');
        onLogout();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setUsers(data.users || []);
      setTransactions(data.transactions || []);
      setCompanySettings(data.companySettings || { total_credits: 0 });
      setKundliOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newFullName || !newLoginUsername || !newPassword) {
      addToast('Please fill in all fields.', 'warning');
      return;
    }

    setSubmittingUser(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newLoginUsername,
          password: newPassword,
          fullName: newFullName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      addToast(`User ${newLoginUsername} created successfully!`, 'success');
      setIsUserModalOpen(false);
      setNewFullName('');
      setNewLoginUsername('');
      setNewPassword('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error creating user.', 'error');
    } finally {
      setSubmittingUser(false);
    }
  };
  // Edit User Handlers
  const openEditModal = (user) => {
    setSelectedUserForEdit(user);
    setEditFullName(user.name || '');
    setEditLoginUsername(user.username || '');
    setEditPassword('');
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editFullName || !editLoginUsername) {
      addToast('Name and username are required.', 'warning');
      return;
    }

    setSubmittingUser(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${selectedUserForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editLoginUsername,
          password: editPassword || undefined,
          name: editFullName
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user');

      addToast(`User updated successfully!`, 'success');
      setIsEditUserModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error updating user.', 'error');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to completely delete ${editLoginUsername}? This cannot be undone.`)) return;

    setSubmittingUser(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${selectedUserForEdit.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');

      addToast(`User deleted successfully!`, 'success');
      setIsEditUserModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error deleting user.', 'error');
    } finally {
      setSubmittingUser(false);
    }
  };
  // Allocate Credit Handler
  const handleAllocateCredit = async (e) => {
    e.preventDefault();
    if (!targetUserId) {
      addToast('Please select a user to allocate credits to.', 'warning');
      return;
    }
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid credit count.', 'warning');
      return;
    }
    if (!allocationReason.trim()) {
      addToast('Please enter a reason or reference for this allocation.', 'warning');
      return;
    }

    setSubmittingCredit(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/credits/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId,
          adminEmail: 'Admin',
          creditAmount: amount,
          reason: allocationReason.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to allocate credits');
      }
      
      addToast(`Allocated ${amount} credits successfully`, 'success');
      setIsCreditModalOpen(false);
      setCreditAmount('10');
      setAllocationReason('');
      setTargetUserId('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error allocating credits.', 'error');
    } finally {
      setSubmittingCredit(false);
    }
  };

  // Calculate Metrics
  const regularUsers = users.filter(u => u.role !== 'admin');
  
  const paymentTransactions = transactions.filter(t => t.payment_id != null);
  const totalPaymentsCount = paymentTransactions.length;
  const totalRevenue = paymentTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalCreditsAllocated = transactions
    .filter(t => t.type === 'assign')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const reportTransactions = transactions.filter(t => t.type === 'deduct');
  const totalReportsDelivered = reportTransactions.length;

  // Filter users for directory
  const filteredUsers = regularUsers.filter(u => 
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Chart Data
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        dateObj: d,
        payments: 0,
        credits: 0
      };
    }).reverse();

    transactions.forEach(t => {
      const tDate = new Date(t.created_at);
      const matchedDay = last7Days.find(day => 
        day.dateObj.toDateString() === tDate.toDateString()
      );
      if (matchedDay) {
        if (t.payment_id) {
          matchedDay.payments += Number(t.amount) || 0;
        }
        if (t.type === 'assign') {
          matchedDay.credits += t.amount || 0;
        }
      }
    });

    return last7Days;
  };

  const getOrdersInLastDays = (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return kundliOrders.filter(o => 
      ['paid', 'generated_no_archive', 'archived', 'generating'].includes(o.status) && 
      new Date(o.created_at) >= cutoff
    ).length;
  };

  const getUserEmail = (userId) => {
    const u = users.find(x => x.id === userId);
    return u ? (u.username || u.name) : 'Unknown User';
  };

  return (
    <div className="flex min-h-screen w-full bg-bg-base">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        profile={profile}
      />

      <main className="flex-grow ml-64 p-8 md:p-10 flex flex-col gap-8 min-w-0">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              {activeTab === 'overview' ? 'Business Dashboard' : activeTab === 'users' ? 'User Management' : activeTab === 'transactions' ? 'Transactions & Payments' : 'Kundli Orders Log'}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              {activeTab === 'overview' 
                ? 'High-level business performance metrics and allocation trends.' 
                : activeTab === 'users'
                ? 'Create and manage staff accounts.'
                : activeTab === 'transactions'
                ? 'Review user credit purchases and manual credit allocations.'
                : 'Track who has purchased Kundlis and analyze short-term order frequency.'}
            </p>
          </div>
          
          {activeTab === 'users' && (
            <button 
              className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm active:scale-[0.98] transition cursor-pointer border-none" 
              onClick={() => setIsUserModalOpen(true)}
            >
              <UserPlus size={14} />
              <span>Create New User</span>
            </button>
          )}

          {activeTab === 'overview' && (
            <button 
              className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm active:scale-[0.98] transition cursor-pointer border-none" 
              onClick={() => setIsCreditModalOpen(true)}
            >
              <Coins size={14} />
              <span>Allocate Credits</span>
            </button>
          )}
        </header>

        {activeTab === 'overview' && (
          <OverviewTab 
            loading={loading}
            companySettings={companySettings}
            totalPaymentsCount={totalPaymentsCount}
            totalRevenue={totalRevenue}
            totalCreditsAllocated={totalCreditsAllocated}
            totalReportsDelivered={totalReportsDelivered}
            getChartData={getChartData}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
            filteredUsers={filteredUsers}
            openEditModal={openEditModal}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            getOrdersInLastDays={getOrdersInLastDays}
            kundliOrders={kundliOrders}
            ordersSearchQuery={ordersSearchQuery}
            setOrdersSearchQuery={setOrdersSearchQuery}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab 
            loading={loading}
            transactions={transactions}
            getUserEmail={getUserEmail}
          />
        )}
      </main>

      <CreateUserModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        handleCreateUser={handleCreateUser}
        newFullName={newFullName}
        setNewFullName={setNewFullName}
        newLoginUsername={newLoginUsername}
        setNewLoginUsername={setNewLoginUsername}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        submittingUser={submittingUser}
      />

      <EditUserModal 
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        handleUpdateUser={handleUpdateUser}
        handleDeleteUser={handleDeleteUser}
        editFullName={editFullName}
        setEditFullName={setEditFullName}
        editLoginUsername={editLoginUsername}
        setEditLoginUsername={setEditLoginUsername}
        editPassword={editPassword}
        setEditPassword={setEditPassword}
        submittingUser={submittingUser}
      />

      <AllocateCreditModal 
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        handleAllocateCredit={handleAllocateCredit}
        users={users}
        targetUserId={targetUserId}
        setTargetUserId={setTargetUserId}
        creditAmount={creditAmount}
        setCreditAmount={setCreditAmount}
        allocationReason={allocationReason}
        setAllocationReason={setAllocationReason}
        submittingCredit={submittingCredit}
      />

      <OrderDetailsModal 
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        addToast={addToast}
      />
    </div>
  );
}
