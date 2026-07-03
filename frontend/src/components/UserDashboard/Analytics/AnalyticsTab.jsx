import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';

export default function AnalyticsTab({ loading, kundliOrders }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex flex-col gap-8"
    >
      <h2 className="text-xl font-bold text-text-main mb-2">Order Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Order Volume Trend */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5">
          <h3 className="text-sm font-semibold text-text-main mb-4">Orders Over Time (Last 30 Days)</h3>
          <div className="h-64 w-full">
            {(() => {
              if (loading) return <div className="h-full flex items-center justify-center text-text-muted text-xs">Loading data...</div>;
              
              // Generate last 30 days
              const data = [];
              const today = new Date();
              for(let i=29; i>=0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                data.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), orders: 0, rawDate: d });
              }
              
              kundliOrders.forEach(order => {
                const orderDate = new Date(order.created_at);
                const matchingDay = data.find(d => 
                  d.rawDate.getDate() === orderDate.getDate() && 
                  d.rawDate.getMonth() === orderDate.getMonth() &&
                  d.rawDate.getFullYear() === orderDate.getFullYear()
                );
                if(matchingDay) matchingDay.orders++;
              });

              const option = {
                tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e5e5e5', textStyle: { color: '#0a0a0a', fontSize: 12 }, extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;' },
                grid: { top: 10, right: 10, bottom: 20, left: 30 },
                xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#737373', fontSize: 10, margin: 12 } },
                yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e5e5e5' } }, axisLabel: { color: '#737373', fontSize: 10 }, minInterval: 1 },
                series: [{ data: data.map(d => d.orders), type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#0a0a0a' }, lineStyle: { width: 3 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(10,10,10,0.1)' }, { offset: 1, color: 'rgba(10,10,10,0)' }] } } }]
              };
              return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5">
          <h3 className="text-sm font-semibold text-text-main mb-4">Order Status Distribution</h3>
          <div className="h-64 w-full">
            {(() => {
              if (loading) return <div className="h-full flex items-center justify-center text-text-muted text-xs">Loading data...</div>;
              
              const counts = kundliOrders.reduce((acc, order) => {
                const s = order.status || 'unknown';
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {});

              const data = Object.keys(counts).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                value: counts[key]
              }));

              const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];

              if(data.length === 0) return <div className="h-full flex items-center justify-center text-text-muted text-xs">No data available</div>;
              const option = {
                tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#e5e5e5', textStyle: { color: '#0a0a0a', fontSize: 12 }, extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;' },
                legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: '#737373' } },
                series: [{ type: 'pie', radius: ['55%', '80%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, labelLine: { show: false }, data: data.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: COLORS[i % COLORS.length] } })) }]
              };
              return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </div>

        {/* Chart 3: Report Types */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-main mb-4">Report Type Popularity</h3>
          <div className="h-64 w-full">
            {(() => {
              if (loading) return <div className="h-full flex items-center justify-center text-text-muted text-xs">Loading data...</div>;
              
              const counts = kundliOrders.reduce((acc, order) => {
                const t = order.report_type || 'Standard';
                acc[t] = (acc[t] || 0) + 1;
                return acc;
              }, {});

              const data = Object.keys(counts).map(key => ({
                name: key,
                orders: counts[key]
              })).sort((a,b) => b.orders - a.orders);

              if(data.length === 0) return <div className="h-full flex items-center justify-center text-text-muted text-xs">No data available</div>;

              const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#e5e5e5', textStyle: { color: '#0a0a0a', fontSize: 12 }, extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;' },
                grid: { top: 10, right: 10, bottom: 20, left: 30 },
                xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#737373', fontSize: 10, margin: 12 } },
                yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e5e5e5' } }, axisLabel: { color: '#737373', fontSize: 10 }, minInterval: 1 },
                series: [{ data: data.map(d => d.orders), type: 'bar', itemStyle: { color: '#0a0a0a', borderRadius: [4, 4, 0, 0] }, barWidth: '40%' }]
              };
              return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </div>

        {/* Chart 4: Geographic State Distribution */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5">
          <h3 className="text-sm font-semibold text-text-main mb-4">Top Geographic States</h3>
          <div className="h-64 w-full">
            {(() => {
              if (loading) return <div className="h-full flex items-center justify-center text-text-muted text-xs">Loading data...</div>;
              
              const counts = kundliOrders.reduce((acc, order) => {
                if (!order.state) return acc;
                const s = order.state.trim().toUpperCase();
                if (s.length > 0) acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {});

              let data = Object.keys(counts).map(key => ({
                name: key.length > 15 ? key.substring(0, 15) + '...' : key,
                orders: counts[key]
              })).sort((a,b) => b.orders - a.orders);

              if(data.length > 7) {
                const top = data.slice(0, 6);
                const othersCount = data.slice(6).reduce((sum, d) => sum + d.orders, 0);
                top.push({ name: 'OTHERS', orders: othersCount });
                data = top;
              }

              if(data.length === 0) return <div className="h-full flex items-center justify-center text-text-muted text-xs">No data available</div>;

              const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#e5e5e5', textStyle: { color: '#0a0a0a', fontSize: 12 }, extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;' },
                grid: { top: 10, right: 20, bottom: 20, left: 80 },
                xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e5e5e5' } }, axisLabel: { color: '#737373', fontSize: 10 }, minInterval: 1 },
                yAxis: { type: 'category', data: data.map(d => d.name).reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#737373', fontSize: 10 } },
                series: [{ data: data.map(d => d.orders).reverse(), type: 'bar', itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] }, barWidth: '50%' }]
              };
              return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </div>

        {/* Chart 5: Age Demographics */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-5">
          <h3 className="text-sm font-semibold text-text-main mb-4">Age Demographics</h3>
          <div className="h-64 w-full">
            {(() => {
              if (loading) return <div className="h-full flex items-center justify-center text-text-muted text-xs">Loading data...</div>;
              
              const brackets = {
                'Under 18': 0,
                '18-24': 0,
                '25-34': 0,
                '35-44': 0,
                '45-54': 0,
                '55+': 0,
              };

              const currentYear = new Date().getFullYear();

              kundliOrders.forEach(order => {
                let age = null;
                if (order.dob_year) {
                  age = currentYear - parseInt(order.dob_year);
                } else if (order.date_of_birth) {
                  const dob = new Date(order.date_of_birth);
                  if (!isNaN(dob.getFullYear())) {
                    age = currentYear - dob.getFullYear();
                  }
                }
                
                if (age !== null && !isNaN(age)) {
                  if (age < 18) brackets['Under 18']++;
                  else if (age <= 24) brackets['18-24']++;
                  else if (age <= 34) brackets['25-34']++;
                  else if (age <= 44) brackets['35-44']++;
                  else if (age <= 54) brackets['45-54']++;
                  else brackets['55+']++;
                }
              });

              const data = Object.keys(brackets).map(key => ({
                name: key,
                customers: brackets[key]
              }));

              if(data.every(d => d.customers === 0)) return <div className="h-full flex items-center justify-center text-text-muted text-xs">No data available</div>;

              const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#e5e5e5', textStyle: { color: '#0a0a0a', fontSize: 12 }, extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;' },
                grid: { top: 10, right: 10, bottom: 20, left: 30 },
                xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#737373', fontSize: 10, margin: 12 } },
                yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e5e5e5' } }, axisLabel: { color: '#737373', fontSize: 10 }, minInterval: 1 },
                series: [{ data: data.map(d => d.customers), type: 'bar', itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] }, barWidth: '40%' }]
              };
              return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
