import React from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, FileText, Sparkles, History, AlertCircle, XCircle } from 'lucide-react';

export default function OrdersTab({
  getOrdersInLastDays,
  kundliOrders,
  ordersSearchQuery,
  setOrdersSearchQuery,
  setSelectedOrder
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [ordersSearchQuery]);

  const filteredOrders = kundliOrders
    .filter(order => {
      const searchLower = ordersSearchQuery.toLowerCase();
      return (
        (order.name && order.name.toLowerCase().includes(searchLower)) ||
        (order.email && order.email.toLowerCase().includes(searchLower)) ||
        (order.phone && order.phone.includes(searchLower)) ||
        (order.order_id && order.order_id.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex flex-col gap-8"
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
          <div className="text-2xl font-bold text-text-main">{kundliOrders.length}</div>
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
            {kundliOrders.filter(o => o.status?.toLowerCase() === 'delivered').length}
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
            {kundliOrders.filter(o => {
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
            {kundliOrders.filter(o => {
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
            {kundliOrders.filter(o => ['failed', 'drive_failed'].includes(o.status)).length}
          </div>
          <span className="text-[10px] text-text-muted">Generation failed</span>
        </div>
      </section>

      {/* Orders list table */}
      <section className="bg-bg-card border border-border-subtle rounded-xl shadow-subtle flex flex-col gap-0">
        <div className="p-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-text-main">Detailed Kundli Purchase History</h3>
          <div className="relative w-full md:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or Order ID..."
              value={ordersSearchQuery}
              onChange={(e) => setOrdersSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-border-subtle rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:bg-white transition"
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ['paid', 'generated_no_archive', 'archived'].includes(order.status)
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
