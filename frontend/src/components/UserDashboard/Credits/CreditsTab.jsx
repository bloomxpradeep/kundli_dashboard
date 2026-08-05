import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, History, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

const getTransactionTypeDetails = (t, profile) => {
  const userName = t.astrologers?.name || profile?.name || 'Account Update';
  if (t.payment_id) {
    return {
      label: 'Credit Purchase',
      desc: userName,
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      prefix: '+'
    };
  }
  
  switch (t.type) {
    case 'assign':
      return {
        label: 'Credit Added',
        desc: userName,
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        prefix: '+'
      };
    case 'deduct':
      return {
        label: 'Credits Deducted',
        desc: userName,
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-100',
        prefix: '-'
      };
    case 'refund':
      return {
        label: 'Refund',
        desc: userName,
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        prefix: '+'
      };
    default:
      return {
        label: 'Adjustment',
        desc: userName,
        badgeClass: 'bg-neutral-50 text-neutral-700 border border-neutral-100',
        prefix: ''
      };
  }
};

export default function CreditsTab({ companySettings, transactions, setIsCreditPurchaseModalOpen, profile }) {
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = [...transactions]
    .filter(t => t.type !== 'deduct')
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const details = getTransactionTypeDetails(t, profile);
      const dateStr = new Date(t.created_at).toLocaleDateString().toLowerCase();
      return (
        dateStr.includes(q) ||
        (details.label || '').toLowerCase().includes(q) ||
        (details.desc || '').toLowerCase().includes(q) ||
        (t.astrologers?.name || '').toLowerCase().includes(q) ||
        String(t.amount || '').includes(q) ||
        String(t.total_credits_assigned || '').includes(q) ||
        (t.note || '').toLowerCase().includes(q) ||
        (t.payment_id || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA, valB;
      const detailsA = getTransactionTypeDetails(a, profile);
      const detailsB = getTransactionTypeDetails(b, profile);
      
      switch (sortField) {
        case 'created_at':
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
        case 'activity':
          valA = detailsA.label.toLowerCase();
          valB = detailsB.label.toLowerCase();
          break;
        case 'impact':
          valA = Number(a.amount) || 0;
          valB = Number(b.amount) || 0;
          break;
        case 'balance':
          valA = Number(a.total_credits_assigned) || 0;
          valB = Number(b.total_credits_assigned) || 0;
          break;
        case 'status':
          valA = a.payment_id || 'success';
          valB = b.payment_id || 'success';
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
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex flex-col gap-8"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Available Credits</span>
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
              {companySettings?.credits_used || 0}
            </div>
          </div>
        </div>

      </section>

      <section className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h3 className="text-sm font-semibold text-text-main hidden sm:block">Billing Activity</h3>
          <div className="relative w-full sm:w-64 sm:ml-auto">
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

        <div className="border border-border-subtle rounded-lg overflow-hidden custom-scrollbar overflow-x-auto text-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-border-subtle">
                <th 
                  className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1.5">Timestamp <SortIcon field="created_at" /></div>
                </th>
                <th 
                  className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => handleSort('activity')}
                >
                  <div className="flex items-center gap-1.5">Activity Log <SortIcon field="activity" /></div>
                </th>
                <th 
                  className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => handleSort('impact')}
                >
                  <div className="flex items-center gap-1.5">Credits Impact <SortIcon field="impact" /></div>
                </th>
                <th 
                  className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => handleSort('balance')}
                >
                  <div className="flex items-center gap-1.5">Balance After <SortIcon field="balance" /></div>
                </th>
                <th 
                  className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1.5">Invoice No / Ref <SortIcon field="status" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No billing activity logged.
                  </td>
                </tr>
              ) : (
                sortedTransactions
                  .map((t) => {
                    const details = getTransactionTypeDetails(t, profile);
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/50">
                        <td className="p-4 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <Calendar size={12} />
                            <span>{new Date(t.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-main">{details.label}</span>
                            <span className="text-[10px] text-text-muted mt-0.5">{details.desc}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${details.badgeClass}`}>
                            {details.prefix}{t.amount || 0} credits
                          </span>
                        </td>
                        <td className="p-4 align-middle font-medium text-text-main whitespace-nowrap">
                          {t.total_credits_assigned || '-'}
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs text-text-main max-w-xs truncate" title={t.note}>{t.note || '-'}</span>
                            {t.payment_id && <span className="text-[10px] text-text-muted mt-0.5">PayID: {t.payment_id}</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
