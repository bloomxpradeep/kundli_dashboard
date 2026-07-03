import React from 'react';
import Modal from '../../Shared/Modal/Modal';
import { ExternalLink, Copy } from 'lucide-react';

export default function OrderDetailsModal({ selectedOrder, setSelectedOrder, addToast }) {
  return (
    <Modal
      isOpen={!!selectedOrder}
      onClose={() => setSelectedOrder(null)}
      title="Full Order Details"
      description={selectedOrder ? `Order ID: ${selectedOrder.order_id}` : ''}
      maxWidth="max-w-3xl"
    >
      {selectedOrder && (
        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 space-y-6">
          
          {/* Customer Info Card */}
          <div>
            <h4 className="text-[11px] font-bold text-text-main uppercase tracking-wider mb-3">Customer Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-xl border border-border-subtle">
              <div className="col-span-1 sm:col-span-2 md:col-span-1">
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Name</span>
                <span className="font-medium text-text-main text-sm">{selectedOrder.name || '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Phone</span>
                <span className="font-medium text-text-main text-sm">{selectedOrder.phone || '-'}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Email</span>
                <span className="font-medium text-text-main text-sm">{selectedOrder.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* Birth Details Card */}
          <div>
            <h4 className="text-[11px] font-bold text-text-main uppercase tracking-wider mb-3">Birth Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-border-subtle">
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Date of Birth</span>
                <span className="font-medium text-text-main text-sm">
                  {selectedOrder.dob_day ? `${selectedOrder.dob_day}/${selectedOrder.dob_month}/${selectedOrder.dob_year}` : selectedOrder.date_of_birth || '-'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Time of Birth</span>
                <span className="font-medium text-text-main text-sm">
                  {selectedOrder.birth_hour != null ? `${String(selectedOrder.birth_hour).padStart(2, '0')}:${String(selectedOrder.birth_min || 0).padStart(2, '0')}` : selectedOrder.time_of_birth || '-'} {selectedOrder.am_pm}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Gender</span>
                <span className="font-medium text-text-main text-sm capitalize">{selectedOrder.gender || '-'}</span>
              </div>
              
              <div className="col-span-2 md:col-span-3 border-t border-border-subtle pt-3 mt-1"></div>
              
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Place of Birth</span>
                <span className="font-medium text-text-main text-sm">{selectedOrder.place || '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">State / Pincode</span>
                <span className="font-medium text-text-main text-sm">{selectedOrder.state || '-'} {selectedOrder.pincode}</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Coordinates (Lat/Lon)</span>
                <span className="font-medium text-text-main font-mono text-xs">
                  {selectedOrder.lat != null ? `${selectedOrder.lat}, ${selectedOrder.lon}` : '-'} <span className="text-text-muted">(TZ: {selectedOrder.tzone != null ? selectedOrder.tzone : '-'})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Order & Payment Card */}
          <div>
            <h4 className="text-[11px] font-bold text-text-main uppercase tracking-wider mb-3">Order & Payment</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-xl border border-border-subtle">
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Report Tier</span>
                <span className="font-medium text-text-main text-sm capitalize">{selectedOrder.report_tier || '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Language</span>
                <span className="font-medium text-text-main text-sm capitalize">{selectedOrder.language || selectedOrder.lang || '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Amount Paid</span>
                <span className="font-medium text-text-main text-sm">
                  {selectedOrder.amount_rupees ? `₹${selectedOrder.amount_rupees}` : (selectedOrder.amount_paise ? `₹${selectedOrder.amount_paise}` : '-')} {selectedOrder.currency}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  ['paid', 'generated_no_archive', 'archived'].includes(selectedOrder.status)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {selectedOrder.status || 'unknown'}
                </span>
              </div>
              
              <div className="col-span-2 md:col-span-4 border-t border-border-subtle pt-3 mt-1"></div>
              
              <div className="col-span-2 md:col-span-1">
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Payment ID</span>
                <span className="font-medium text-text-main font-mono text-[11px] break-all">{selectedOrder.payment_id || '-'}</span>
              </div>
              <div className="col-span-1">
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Order Timestamp</span>
                <span className="font-medium text-text-main text-xs">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="col-span-1">
                <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Last Updated</span>
                <span className="font-medium text-text-main text-xs">{new Date(selectedOrder.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Output Full Width */}
          <div className="pt-2 border-t border-border-subtle">
            <h4 className="text-[11px] font-bold text-text-main uppercase tracking-wider mb-3">Delivery Output</h4>
            {selectedOrder.drive_link ? (
              <div className="flex items-center gap-3">
                <a href={selectedOrder.drive_link} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
                  <ExternalLink size={16} /> Open Drive Link
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedOrder.drive_link);
                    addToast('Link copied to clipboard', 'success');
                  }}
                  className="px-5 py-2.5 bg-neutral-100 text-text-main hover:bg-neutral-200 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Copy size={16} /> Copy URL
                </button>
              </div>
            ) : selectedOrder.error_detail ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-mono text-xs break-all whitespace-pre-wrap">
                {selectedOrder.error_detail}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic bg-neutral-50 border border-border-subtle rounded-xl p-4 text-center">No delivery output generated yet.</p>
            )}
          </div>

        </div>
      )}
    </Modal>
  );
}
