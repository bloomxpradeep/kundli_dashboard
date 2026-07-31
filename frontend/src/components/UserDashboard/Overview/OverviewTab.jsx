import React from 'react';
import { motion } from 'framer-motion';
import { Coins, FileText, ExternalLink } from 'lucide-react';

const EXTERNAL_PURCHASE_FORM_URL = "https://razorpay.com/demo/";

export default function OverviewTab({ 
  loading, 
  companySettings, 
  kundliOrders, 
  setIsCreditPurchaseModalOpen 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex flex-col gap-8"
    >
      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Remaining Balance</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <Coins size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-main leading-none">
              {loading ? '...' : (companySettings?.total_credits || 0)}
            </div>
            <div className="flex items-center justify-between mt-1.5 gap-2">
              <span className="text-[10px] text-text-muted leading-tight">
                Use these credits to request custom Kundli files
              </span>
              {/* <button 
                onClick={() => setIsCreditPurchaseModalOpen(true)}
                className="px-3 py-1.5 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition shadow-sm font-semibold text-[10px] flex-shrink-0 cursor-pointer"
              >
                + Buy Credits
              </button> */}
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Reports Ordered</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-main leading-none">
              {loading ? '...' : kundliOrders.length}
            </div>
            <span className="text-[10px] text-text-muted mt-1.5 block">
              Total files delivered directly to customers
            </span>
          </div>
        </div>
      </section>


    </motion.div>
  );
}
