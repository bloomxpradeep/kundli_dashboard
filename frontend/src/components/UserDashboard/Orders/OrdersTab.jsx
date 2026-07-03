import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, History, Search, ExternalLink, AlertCircle, XCircle } from 'lucide-react';
import DatePicker from '../../Shared/DatePicker/DatePicker';

export default function OrdersTab({
  loading,
  kundliOrders,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  currentPage,
  setCurrentPage,
  PAGE_SIZE,
  setSelectedOrder
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      {/* Insight Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Orders</span>
            <div className="p-1.5 bg-neutral-50 border border-border-subtle rounded-lg text-text-muted">
              <FileText size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-main">{loading ? '…' : kundliOrders.length}</div>
          <span className="text-[10px] text-text-muted">All time orders placed</span>
        </div>

        {/* Delivered */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Delivered</span>
            <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
              <Sparkles size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {loading ? '…' : kundliOrders.filter(o => o.status?.toLowerCase() === 'delivered').length}
          </div>
          <span className="text-[10px] text-text-muted">Successfully delivered</span>
        </div>

        {/* Pending */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Pending</span>
            <div className="p-1.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-600">
              <History size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {loading ? '…' : kundliOrders.filter(o => {
              if (o.status?.toLowerCase() === 'delivered' || ['failed', 'drive_failed'].includes(o.status)) return false;
              if (Date.now() - new Date(o.created_at).getTime() > 24 * 60 * 60 * 1000) return false;
              return true;
            }).length}
          </div>
          <span className="text-[10px] text-text-muted">Active (Under 24h)</span>
        </div>

        {/* Not Delivered */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Not Delivered</span>
            <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-600">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {loading ? '…' : kundliOrders.filter(o => {
              if (o.status?.toLowerCase() === 'delivered' || ['failed', 'drive_failed'].includes(o.status)) return false;
              if (Date.now() - new Date(o.created_at).getTime() > 24 * 60 * 60 * 1000) return true;
              return false;
            }).length}
          </div>
          <span className="text-[10px] text-text-muted">Past 24h</span>
        </div>

        {/* Failed */}
        <div className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle p-4 flex flex-col gap-2 hover:shadow-premium transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Failed</span>
            <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-600">
              <XCircle size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {loading ? '…' : kundliOrders.filter(o => ['failed', 'drive_failed'].includes(o.status)).length}
          </div>
          <span className="text-[10px] text-text-muted">Generation failed</span>
        </div>
      </section>

      {/* Orders Table */}
      <section className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle flex flex-col">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={13} className="text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search name, email, Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-[7px] bg-neutral-50 border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:bg-white transition"
            />
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border-subtle" />

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-[7px] bg-neutral-50 border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:bg-white text-text-main cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="created">Created</option>
              <option value="paid">Paid</option>
              <option value="generated_no_archive">Generated</option>
              <option value="archived">Archived</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted" />
              </svg>
            </div>
          </div>

          {/* Divider between Status and Date */}
          <div className="h-6 w-px bg-border-subtle" />

          {/* Date preset */}
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
              className="appearance-none pl-3 pr-8 py-[7px] bg-neutral-50 border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:bg-white text-text-main cursor-pointer"
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

          {/* Custom date range pickers */}
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
              {(() => {
                if (loading) return (
                  <tr><td colSpan={7} className="p-8 text-center text-text-muted">Loading purchase logs...</td></tr>
                );
                if (kundliOrders.length === 0) return (
                  <tr><td colSpan={7} className="p-8 text-center text-text-muted">No Kundli reports purchased yet.</td></tr>
                );

                const filteredOrders = kundliOrders
                  .filter(order => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch = (
                      (order.name && order.name.toLowerCase().includes(q)) ||
                      (order.email && order.email.toLowerCase().includes(q)) ||
                      (order.phone && order.phone.includes(q)) ||
                      (order.order_id && order.order_id.toLowerCase().includes(q))
                    );
                    if (!matchesSearch) return false;
                    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
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

                const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

                if (paginatedOrders.length === 0) return (
                  <tr><td colSpan={7} className="p-8 text-center text-text-muted">No orders match your filters.</td></tr>
                );

                return paginatedOrders.map((order) => (
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
                        <span className="font-semibold text-text-main capitalize">{order.report_tier || 'Standard'}</span>
                        <span className="text-[10px] text-text-muted capitalize">{order.language || order.lang || 'English'}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      <span className="font-medium text-text-main">
                        {order.amount_rupees ? `₹${order.amount_rupees}` : (order.amount_paise ? `₹${order.amount_paise}` : '-')}
                      </span>
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${['paid', 'generated_no_archive', 'archived'].includes(order.status)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                        {order.status || 'unknown'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.drive_link && (
                          <a
                            href={order.drive_link}
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
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {(() => {
          const filtered = kundliOrders.filter(order => {
            const s = searchQuery.toLowerCase();
            const matchesSearch = (
              (order.name && order.name.toLowerCase().includes(s)) ||
              (order.email && order.email.toLowerCase().includes(s)) ||
              (order.phone && order.phone.includes(s)) ||
              (order.order_id && order.order_id.toLowerCase().includes(s))
            );
            if (!matchesSearch) return false;
            if (statusFilter !== 'all' && order.status !== statusFilter) return false;
            if (dateFilter === 'all') return true;
            const d = new Date(order.created_at);
            const now = new Date();
            if (dateFilter === 'today') return d.toDateString() === now.toDateString();
            if (dateFilter === '7days') { const x = new Date(now); x.setDate(now.getDate() - 7); return d >= x; }
            if (dateFilter === '30days') { const x = new Date(now); x.setDate(now.getDate() - 30); return d >= x; }
            if (dateFilter === '90days') { const x = new Date(now); x.setDate(now.getDate() - 90); return d >= x; }
            if (dateFilter === 'custom') {
              if (customStartDate && customEndDate) { const s2 = new Date(customStartDate); s2.setHours(0, 0, 0, 0); const e = new Date(customEndDate); e.setHours(23, 59, 59, 999); return d >= s2 && d <= e; }
              if (customStartDate) { const s2 = new Date(customStartDate); s2.setHours(0, 0, 0, 0); return d >= s2; }
              if (customEndDate) { const e = new Date(customEndDate); e.setHours(23, 59, 59, 999); return d <= e; }
            }
            return true;
          });
          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
          if (totalPages <= 1) return null;
          return (
            <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                Showing <span className="font-semibold text-text-main">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-text-main">{filtered.length}</span> orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle bg-neutral-50 text-text-main hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-text-muted">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg border transition cursor-pointer ${currentPage === p
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'bg-neutral-50 border-border-subtle text-text-main hover:bg-neutral-100'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle bg-neutral-50 text-text-main hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          );
        })()}
      </section>
    </motion.div>
  );
}
