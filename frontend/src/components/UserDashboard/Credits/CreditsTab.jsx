import React from 'react';
import { motion } from 'framer-motion';
import { Coins, History, Calendar } from 'lucide-react';

const getTransactionTypeDetails = (t) => {
  if (t.payment_id) {
    return {
      label: 'Credit Purchase',
      desc: t.note || `Purchased ${t.amount} credits via Razorpay`,
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      prefix: '+'
    };
  }
  
  switch (t.type) {
    case 'assign':
      return {
        label: 'Credit Added',
        desc: t.note || `Credits added to account`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        prefix: '+'
      };
    case 'deduct':
      return {
        label: 'Credits Deducted',
        desc: t.note || 'Generated Kundli report or manual deduction',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-100',
        prefix: '-'
      };
    case 'refund':
      return {
        label: 'Refund',
        desc: t.note || 'Refund for failed request',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        prefix: '+'
      };
    default:
      return {
        label: 'Adjustment',
        desc: t.note || 'Balance transaction update',
        badgeClass: 'bg-neutral-50 text-neutral-700 border border-neutral-100',
        prefix: ''
      };
  }
};

export default function CreditsTab({ companySettings, transactions, setIsCreditPurchaseModalOpen }) {
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
            <button 
              onClick={() => setIsCreditPurchaseModalOpen(true)}
              className="px-3 py-1.5 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition shadow-sm font-semibold text-[10px] mt-3 self-start cursor-pointer"
            >
              + Buy Credits
            </button>
          </div>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Credits Used</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <History size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-main leading-none">
            {transactions.filter(t => t.type === 'deduct').reduce((sum, t) => sum + (t.amount || 0), 0)}
          </div>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Top-ups</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <Coins size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-main leading-none">
            {transactions.filter(t => t.type === 'assign').reduce((sum, t) => sum + (t.amount || 0), 0)}
          </div>
        </div>
      </section>

      <section className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6">
        <div className="border border-border-subtle rounded-lg overflow-hidden custom-scrollbar overflow-x-auto text-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-border-subtle">
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Activity Log</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Credits Impact</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Balance After</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Status/Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No credit activity logged.
                  </td>
                </tr>
              ) : (
                transactions
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((t) => {
                    const details = getTransactionTypeDetails(t);
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
                          {t.balance_after}
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">
                          {t.payment_id ? (
                            <span className="text-[10px] text-text-muted font-mono">{t.payment_id}</span>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100`}>
                              success
                            </span>
                          )}
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
