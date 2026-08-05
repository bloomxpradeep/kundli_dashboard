import React from 'react';
import { motion } from 'framer-motion';
import { Coins, CreditCard, FileText } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export default function OverviewTab({ 
  loading, 
  companySettings, 
  totalPaymentsCount, 
  totalRevenue, 
  totalCreditsAllocatedThisMonth,
  totalCreditsAllocatedAllTime,
  totalReportsDelivered, 
  getChartData 
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5 flex flex-col justify-between gap-3 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Remaining Balance</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <Coins size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-main leading-none mt-4">
            {loading ? '...' : (companySettings?.total_credits || 0)}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Active user profiles</span>
        </div>



        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5 flex flex-col justify-between gap-3 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Credits Distributed</span>
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
                <Coins size={15} />
              </div>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-main leading-none mt-4">
              {loading ? '...' : (creditsView === 'all_time' ? totalCreditsAllocatedAllTime : totalCreditsAllocatedThisMonth)}
            </div>
            <span className="text-[10px] text-text-muted block mt-1.5">
              {creditsView === 'all_time' ? 'Credits assigned all time' : 'Credits assigned this month'}
            </span>
          </div>
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5 flex flex-col justify-between gap-3 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Reports Archived</span>
            <div className="p-1.5 bg-neutral-50 text-text-main border border-border-subtle rounded-lg">
              <FileText size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-main leading-none">
              {loading ? '...' : totalReportsDelivered}
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">Total reports successfully archived</span>
          </div>
        </div>
      </section>

      {/* Analytical Chart */}
      <section className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-text-main">Distribution and Revenue Timeline (7 Days)</h3>
        <div className="w-full h-[260px]">
          {(() => {
            const data = getChartData();
            const option = {
              tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e5e5e5', textStyle: { color: '#0a0a0a', fontSize: 12 }, extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;' },
              grid: { top: 20, right: 10, bottom: 20, left: 30 },
              xAxis: { type: 'category', data: data.map(d => d.dateStr), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#737373', fontSize: 10 } },
              yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e5e5e5' } }, axisLabel: { color: '#737373', fontSize: 10 } },
              series: [
                { name: 'Revenue (₹)', data: data.map(d => d.payments), type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#10B981' }, lineStyle: { width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.1)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }] } } },
                { name: 'Credits Assigned', data: data.map(d => d.credits), type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#111111' }, lineStyle: { width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(17, 17, 17, 0.06)' }, { offset: 1, color: 'rgba(17, 17, 17, 0)' }] } } }
              ]
            };
            return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
          })()}
        </div>
      </section>
    </motion.div>
  );
}
