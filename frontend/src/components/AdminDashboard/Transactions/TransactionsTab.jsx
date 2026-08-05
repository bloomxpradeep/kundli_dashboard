import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Users, Coins, History, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

export default function TransactionsTab({
  loading,
  transactions,
  companySettings
}) {
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const sortedTransactions = [...transactions]
    .filter(t => t.type !== 'deduct')
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const dateStr = new Date(t.created_at).toLocaleDateString().toLowerCase();
      const typeStr = t.payment_id ? 'razorpay purchase' : t.type === 'assign' ? 'admin allocation' : (t.type || '').toLowerCase();
      return (
        dateStr.includes(q) ||
        (t.astrologers?.name || '').toLowerCase().includes(q) ||
        (t.astrologers?.email || '').toLowerCase().includes(q) ||
        typeStr.includes(q) ||
        String(t.amount || '').includes(q) ||
        String(t.total_credits_assigned || '').includes(q) ||
        (t.note || '').toLowerCase().includes(q) ||
        (t.payment_id || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'created_at':
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
        case 'user':
          valA = (a.astrologers?.name || a.astrologers?.email || '').toLowerCase();
          valB = (b.astrologers?.name || b.astrologers?.email || '').toLowerCase();
          break;
        case 'type':
          valA = a.payment_id ? 'Razorpay Purchase' : a.type === 'assign' ? 'Admin Allocation' : a.type;
          valB = b.payment_id ? 'Razorpay Purchase' : b.type === 'assign' ? 'Admin Allocation' : b.type;
          break;
        case 'amount':
          valA = Number(a.amount) || 0;
          valB = Number(b.amount) || 0;
          break;
        case 'balance':
          valA = Number(a.total_credits_assigned) || 0;
          valB = Number(b.total_credits_assigned) || 0;
          break;
        case 'note':
          valA = (a.note || '').toLowerCase();
          valB = (b.note || '').toLowerCase();
          break;
        default:
          valA = 0;
          valB = 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-neutral-400" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-text-main" /> : <ArrowDown size={12} className="text-text-main" />;
  };
  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total User Credits Available</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <Coins size={16} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-text-main leading-none">
              {companySettings?.total_credits || 0}
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Credits Used</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <History size={16} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-text-main leading-none">
              {companySettings?.total_credits_used || 0}
            </div>
          </div>
        </div>
      </section>

    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="bg-white border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h3 className="text-sm font-semibold text-text-main">Credit Purchases & Allocations</h3>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-neutral-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border border-neutral-300 bg-neutral-50 rounded-md pl-9 pr-3 py-2 outline-none focus:border-[#800020]/50 focus:bg-white focus:ring-4 focus:ring-[#800020]/10 w-full text-neutral-900 placeholder:text-neutral-500 transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="border border-border-subtle rounded-lg overflow-hidden custom-scrollbar overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-border-subtle">
              <th 
                className="font-semibold text-text-main p-3 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1.5">Date <SortIcon field="created_at" /></div>
              </th>
              <th 
                className="font-semibold text-text-main p-3 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                onClick={() => handleSort('user')}
              >
                <div className="flex items-center gap-1.5">User Account <SortIcon field="user" /></div>
              </th>
              <th 
                className="font-semibold text-text-main p-3 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1.5">Type <SortIcon field="type" /></div>
              </th>
              <th 
                className="font-semibold text-text-main p-3 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1.5">Credits Amount <SortIcon field="amount" /></div>
              </th>
              <th 
                className="font-semibold text-text-main p-3 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center gap-1.5">Balance After <SortIcon field="balance" /></div>
              </th>
              <th 
                className="font-semibold text-text-main p-3 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                onClick={() => handleSort('note')}
              >
                <div className="flex items-center gap-1.5">Invoice No / Ref <SortIcon field="note" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">Loading transactions...</td>
              </tr>
            ) : sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">No transactions found.</td>
              </tr>
            ) : (
              sortedTransactions
                .map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 align-middle text-text-muted whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-main">{t.astrologers?.name || 'Unknown User'}</span>
                        <span className="text-[10px] text-text-muted">{t.astrologers?.email}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {t.payment_id ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CreditCard size={12} /> Razorpay Purchase
                        </span>
                      ) : t.type === 'assign' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <Users size={12} /> Admin Allocation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase">
                          {t.type}
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`font-bold ${t.type === 'assign' || t.type === 'refund' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'assign' || t.type === 'refund' ? '+' : '-'}{t.amount}
                      </span>
                    </td>
                    <td className="p-4 align-middle font-medium text-text-main">
                      {t.total_credits_assigned || '-'}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="text-xs text-text-main max-w-xs truncate" title={t.note}>{t.note || '-'}</span>
                        {t.payment_id && <span className="text-[10px] text-text-muted mt-0.5">PayID: {t.payment_id}</span>}
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
    </div>
  );
}
