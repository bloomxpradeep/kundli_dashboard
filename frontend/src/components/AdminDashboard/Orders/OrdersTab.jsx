import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, FileText, History, XCircle, Download } from 'lucide-react';
import DatePicker from '../../Shared/DatePicker/DatePicker';
import * as XLSX from 'xlsx';

export default function OrdersTab({
  getOrdersInLastDays,
  kundliOrders,
  ordersSearchQuery,
  setOrdersSearchQuery,
  setSelectedOrder,
  refreshTrigger
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const uniqueStatuses = React.useMemo(() => {
    const statuses = kundliOrders.map(o => (o.kundli_status || o.status)?.toLowerCase()).filter(Boolean);
    return [...new Set(statuses)].sort();
  }, [kundliOrders]);

  const uniqueReportTypes = React.useMemo(() => {
    const types = kundliOrders.map(o => (o.report_tier || o.report_name)?.toLowerCase()).filter(Boolean);
    return [...new Set(types)].sort();
  }, [kundliOrders]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [ordersSearchQuery, statusFilter, reportTypeFilter, dateFilter, customStartDate, customEndDate]);

  React.useEffect(() => {
    if (refreshTrigger > 0) {
      setStatusFilter('all');
      setReportTypeFilter('all');
      setDateFilter('all');
      setCustomStartDate('');
      setCustomEndDate('');
      setCurrentPage(1);
    }
  }, [refreshTrigger]);

  const filteredOrders = kundliOrders
    .filter(order => {
      const q = ordersSearchQuery.toLowerCase();
      if (q) {
        const matchesSearch = (
          (order.name && order.name.toLowerCase().includes(q)) ||
          (order.email && order.email.toLowerCase().includes(q)) ||
          (order.phone && order.phone.includes(q)) ||
          (order.order_id && order.order_id.toLowerCase().includes(q)) ||
          (order.order_total_amount_raw && order.order_total_amount_raw.includes(q))
        );
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && (order.kundli_status || order.status)?.toLowerCase() !== statusFilter) return false;
      if (reportTypeFilter !== 'all' && (order.report_tier || order.report_name)?.toLowerCase() !== reportTypeFilter) return false;
      
      if (dateFilter === 'all') return true;
      const d = new Date(order.created_at);
      const now = new Date();
      if (dateFilter === 'today') return d.toDateString() === now.toDateString();
      if (dateFilter === '7days') { const x = new Date(now); x.setDate(now.getDate() - 7); return d >= x; }
      if (dateFilter === '30days') { const x = new Date(now); x.setDate(now.getDate() - 30); return d >= x; }
      if (dateFilter === '90days') { const x = new Date(now); x.setDate(now.getDate() - 90); return d >= x; }
      if (dateFilter === 'custom') {
        if (customStartDate && customEndDate) {
          const s = new Date(customStartDate); s.setHours(0, 0, 0, 0);
          const e = new Date(customEndDate); e.setHours(23, 59, 59, 999);
          return d >= s && d <= e;
        }
        if (customStartDate) { const s = new Date(customStartDate); s.setHours(0, 0, 0, 0); return d >= s; }
        if (customEndDate) { const e = new Date(customEndDate); e.setHours(23, 59, 59, 999); return d <= e; }
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = (type) => {
    const exportData = filteredOrders.map(order => {
      // Amount mapping
      const amount = order.order_total_amount ? `₹${order.order_total_amount}` : (order.amount_rupees ? `₹${order.amount_rupees}` : (order.amount_paise ? `₹${order.amount_paise}` : '-'));
      const currency = order.currency || '';
      
      // DOB mapping
      const dob = order.dob_day ? `${order.dob_day}/${order.dob_month}/${order.dob_year}` : (order.date_of_birth || '-');
      const tob = order.birth_hour != null ? `${String(order.birth_hour).padStart(2, '0')}:${String(order.birth_min || 0).padStart(2, '0')} ${order.am_pm || ''}` : (order.time_of_birth || '-');
      
      return {
        'Order ID': order.order_id || 'N/A',
        'Order Timestamp': new Date(order.created_at).toLocaleString(),
        'Last Updated': new Date(order.updated_at).toLocaleString(),
        'Customer Name': order.name || 'N/A',
        'Email': order.email || 'N/A',
        'Phone': order.phone || 'N/A',
        'Report Tier': order.report_tier || order.report_name || 'N/A',
        'Language': order.language || order.lang || order.report_language || 'N/A',
        'Amount Paid': `${amount} ${currency}`.trim(),
        'Base Cost (Raw)': order.order_total_amount_raw ? `₹${order.order_total_amount_raw}` : '-',
        'Status': order.kundli_status || order.status || 'N/A',
        'Date of Birth': dob,
        'Time of Birth': tob,
        'Gender': order.gender || '-',
        'Place of Birth': order.place_of_birth || order.place || '-',
        'State': order.state || '-',
        'Pincode': order.pin_code || order.pincode || '-',
        'Coordinates (Lat/Lon)': (order.latitude != null || order.lat != null) ? `${order.latitude || order.lat}, ${order.longitude || order.lon}` : '-',
        'Timezone': order.tzone != null ? order.tzone : '-',
        'Payment ID': order.payment_id || order.payment_status || '-',
        'Drive Save Attempts': order.kundli_attempts != null ? order.kundli_attempts : '-',
        'Delivery Drive Link': order.kundli_drive_link || order.drive_link || '-',
        'Delivery Error': order.kundli_error || order.error_detail || '-'
      };
    });
    
    if (exportData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `orders_export.${type}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex flex-col gap-8"
    >
      {/* Insight Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Total Orders */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Orders</span>
            <div className="p-1.5 bg-neutral-50 border border-border-subtle rounded-lg text-text-muted">
              <FileText size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-main">{filteredOrders.length}</div>
          <span className="text-[10px] text-text-muted">All time orders placed</span>
        </div>

        {/* Archived */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Archived</span>
            <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
              <History size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {filteredOrders.filter(o => (o.kundli_status || o.status)?.toLowerCase() === 'archived').length}
          </div>
          <span className="text-[10px] text-text-muted">Archived orders</span>
        </div>

        {/* Failed */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Failed Orders</span>
            <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-600">
              <XCircle size={14} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-red-600 leading-none">
                {filteredOrders.filter(o => ['failed', 'drive_failed', 'failed_permanent'].includes((o.kundli_status || o.status)?.toLowerCase())).length}
              </span>
              <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Overall</span>
            </div>
            <div className="h-8 w-px bg-border-subtle"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-red-500 leading-none">
                {filteredOrders.filter(o => {
                  const status = (o.kundli_status || o.status)?.toLowerCase();
                  if (!['failed', 'drive_failed', 'failed_permanent'].includes(status)) return false;
                  return (new Date() - new Date(o.created_at)) <= 24 * 60 * 60 * 1000;
                }).length}
              </span>
              <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Last 24 Hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Orders list table */}
      <section className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle flex flex-col gap-0">
        <div className="px-4 py-4 border-b border-border-subtle flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-text-main">Detailed Kundli Purchase History</h3>
            
            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-border-subtle rounded-lg text-xs font-medium text-text-main transition shadow-sm"
                title="Export as CSV"
              >
                <Download size={13} />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-border-subtle rounded-lg text-xs font-medium text-text-main transition shadow-sm"
                title="Export as Excel"
              >
                <Download size={13} />
                Export XLS
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-neutral-50/50 p-2.5 rounded-lg border border-border-subtle/50">
            <div className="relative flex-grow md:max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search name, email, Order ID, amount..."
                value={ordersSearchQuery}
                onChange={(e) => setOrdersSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-[7px] bg-white border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 transition"
              />
            </div>

            <div className="h-6 w-px bg-border-subtle hidden md:block" />

            <div className="relative">
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-[7px] bg-white border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 text-text-main cursor-pointer"
              >
                <option value="all">All Report Types</option>
                {uniqueReportTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted" />
                </svg>
              </div>
            </div>

            <div className="h-6 w-px bg-border-subtle hidden md:block" />

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-[7px] bg-white border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 text-text-main cursor-pointer"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted" />
                </svg>
              </div>
            </div>

            <div className="h-6 w-px bg-border-subtle hidden md:block" />

            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }
                }}
                className="appearance-none pl-3 pr-8 py-[7px] bg-white border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 text-text-main cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom" hidden>Custom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DatePicker
                value={customStartDate}
                onChange={(val) => { setCustomStartDate(val); setDateFilter('custom'); }}
                placeholder="From date"
                maxDate={customEndDate || undefined}
                align="left"
              />
              <span className="text-text-muted text-xs font-medium">—</span>
              <DatePicker
                value={customEndDate}
                onChange={(val) => { setCustomEndDate(val); setDateFilter('custom'); }}
                placeholder="To date"
                minDate={customStartDate || undefined}
                align="right"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden custom-scrollbar overflow-x-auto rounded-b-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-border-subtle">
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Customer Info</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Report Type</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    No Kundli reports found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 align-middle">
                        <span className="font-medium text-text-main text-[11px] font-mono whitespace-nowrap">{order.order_id || '-'}</span>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap text-text-muted">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-text-main">{order.name || '-'}</span>
                          <span className="text-[10px] text-text-muted">{order.email || order.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-text-main capitalize">{order.report_tier || order.report_name || 'Standard'}</span>
                          <span className="text-[10px] text-text-muted capitalize">{order.language || order.lang || order.report_language || 'English'}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <span className="font-medium text-text-main">
                          {order.order_total_amount ? `₹${order.order_total_amount}` : (order.amount_rupees ? `₹${order.amount_rupees}` : (order.amount_paise ? `₹${order.amount_paise}` : '-'))}
                        </span>
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ['paid', 'generated_no_archive', 'archived'].includes((order.kundli_status || order.status))
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {(order.kundli_status || order.status) || 'unknown'}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(order.kundli_drive_link || order.drive_link) && (
                            <a 
                              href={order.kundli_drive_link || order.drive_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-lg shadow-sm text-[11px] font-semibold flex items-center gap-1.5 transition"
                            >
                              <ExternalLink size={12} /> Drive Link
                            </a>
                          )}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-white border border-border-subtle text-text-main text-[11px] font-semibold hover:bg-neutral-50 rounded-lg shadow-sm transition"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between bg-white rounded-b-xl">
            <span className="text-xs text-text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-border-subtle rounded-lg text-xs font-semibold text-text-main hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex items-center px-2 gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  // Show max 5 page numbers (start, end, and around current)
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                          currentPage === page 
                            ? 'bg-neutral-900 text-white' 
                            : 'text-text-muted hover:bg-neutral-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="text-text-muted text-xs">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-border-subtle rounded-lg text-xs font-semibold text-text-main hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
