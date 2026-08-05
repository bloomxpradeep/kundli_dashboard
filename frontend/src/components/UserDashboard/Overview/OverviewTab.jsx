import React from 'react';
import { motion } from 'framer-motion';
import { Coins, FileText, ExternalLink } from 'lucide-react';

const EXTERNAL_PURCHASE_FORM_URL = "https://razorpay.com/demo/";

export default function OverviewTab({ 
  loading, 
  companySettings, 
  totalCreditsReceivedThisMonth,
  totalCreditsReceivedAllTime,
  kundliOrders,
  setIsCreditPurchaseModalOpen 
}) {
  const [creditsView, setCreditsView] = React.useState('all_time');
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex flex-col gap-8"
    >
      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Credits Received</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-border-subtle">
                <button 
                  onClick={() => setCreditsView('all_time')}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${creditsView === 'all_time' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                  All Time
                </button>
                <button 
                  onClick={() => setCreditsView('this_month')}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${creditsView === 'this_month' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                  This Month
                </button>
              </div>
              <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
                <Coins size={16} />
              </div>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-main leading-none mt-4">
              {loading ? '...' : (creditsView === 'all_time' ? totalCreditsReceivedAllTime : totalCreditsReceivedThisMonth)}
            </div>
            <span className="text-[10px] text-text-muted mt-1.5 block">
              {creditsView === 'all_time' ? 'Credits received all time' : 'Credits received this month'}
            </span>
          </div>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col justify-between gap-3 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Reports Archived</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-main leading-none mt-4">
              {loading ? '...' : (kundliOrders || []).length}
            </div>
            <span className="text-[10px] text-text-muted mt-1.5 block">
              Total reports successfully archived
            </span>
          </div>
        </div>
      </section>


    </motion.div>
  );
}
