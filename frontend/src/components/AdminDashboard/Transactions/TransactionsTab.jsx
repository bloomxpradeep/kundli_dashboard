import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Users } from 'lucide-react';

export default function TransactionsTab({
  loading,
  transactions
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="bg-white border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col gap-4"
    >
      <h3 className="text-sm font-semibold text-text-main mb-2">Credit Purchases & Allocations</h3>
      
      <div className="border border-border-subtle rounded-lg overflow-hidden custom-scrollbar overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-border-subtle">
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">Date</th>
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">User Account</th>
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">Type</th>
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">Credits Amount</th>
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">Balance After</th>
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">Note / Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">Loading transactions...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">No transactions found.</td>
              </tr>
            ) : (
              transactions
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
                      {t.balance_after}
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
  );
}
