import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, FileText, History, XCircle, Download, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import DatePicker from '../../Shared/DatePicker/DatePicker';
import CustomSelect from '../../Shared/CustomSelect/CustomSelect';
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

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-neutral-400" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-text-main" /> : <ArrowDown size={12} className="text-text-main" />;
  };

  const handleResetFilters = () => {
    setOrdersSearchQuery('');
    setReportTypeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortField('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };
  
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

  const reportTypeOptions = React.useMemo(() => [
    { value: 'all', label: 'All Report Types' },
    ...uniqueReportTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ') }))
  ], [uniqueReportTypes]);

  const statusOptions = React.useMemo(() => [
    { value: 'all', label: 'All Status' },
    ...uniqueStatuses.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') }))
  ], [uniqueStatuses]);

  const dateOptions = React.useMemo(() => [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    ...(dateFilter === 'custom' ? [{ value: 'custom', label: 'Custom' }] : [])
  ], [dateFilter]);

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
    .sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'order_id':
          valA = (a.order_id || '').toLowerCase();
          valB = (b.order_id || '').toLowerCase();
          break;
        case 'created_at':
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
        case 'customer':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          break;
        case 'report_type':
          valA = (a.report_tier || a.report_name || '').toLowerCase();
          valB = (b.report_tier || b.report_name || '').toLowerCase();
          break;
        case 'amount':
          valA = Number(a.order_total_amount || a.amount_rupees || a.amount_paise || 0);
          valB = Number(b.order_total_amount || b.amount_rupees || b.amount_paise || 0);
          break;
        case 'status':
          valA = (a.kundli_status || a.status || '').toLowerCase();
          valB = (b.kundli_status || b.status || '').toLowerCase();
          break;
        default:
          valA = 0;
          valB = 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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

            <CustomSelect
              value={reportTypeFilter}
              onChange={setReportTypeFilter}
              options={reportTypeOptions}
              className="w-[180px]"
            />

            <div className="h-6 w-px bg-border-subtle hidden md:block" />

            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="w-[140px]"
            />

            <div className="h-6 w-px bg-border-subtle hidden md:block" />

            <CustomSelect
              value={dateFilter}
              onChange={(val) => {
                setDateFilter(val);
                if (val !== 'custom') {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }
              }}
              options={dateOptions}
              className="w-[140px]"
            />

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

            <div className="h-6 w-px bg-border-subtle hidden md:block" />

            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2 px-3 py-[7px] text-xs font-medium text-text-muted hover:text-text-main bg-white hover:bg-neutral-50 border border-border-subtle rounded-lg transition-colors whitespace-nowrap"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden custom-scrollbar overflow-x-auto rounded-b-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-border-subtle">
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none" onClick={() => handleSort('order_id')}>
                  <div className="flex items-center gap-1.5">Order ID <SortIcon field="order_id" /></div>
                </th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1.5">Date <SortIcon field="created_at" /></div>
                </th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none" onClick={() => handleSort('customer')}>
                  <div className="flex items-center gap-1.5">Customer Info <SortIcon field="customer" /></div>
                </th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none" onClick={() => handleSort('report_type')}>
                  <div className="flex items-center gap-1.5">Report Type <SortIcon field="report_type" /></div>
                </th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1.5">Amount <SortIcon field="amount" /></div>
                </th>
                <th className="font-semibold text-text-main p-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">Status <SortIcon field="status" /></div>
                </th>
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
