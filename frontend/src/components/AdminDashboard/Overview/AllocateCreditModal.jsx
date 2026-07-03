import React from 'react';
import Modal from '../../Shared/Modal/Modal';

export default function AllocateCreditModal({
  isOpen,
  onClose,
  handleAllocateCredit,
  companySettings,
  creditAmount,
  setCreditAmount,
  allocationReason,
  setAllocationReason,
  submittingCredit,
  users,
  targetUserId,
  setTargetUserId
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Allocate Global Credits"
      description="Add credits directly to the company's shared pool."
    >
      <form onSubmit={handleAllocateCredit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="target-user">
            Select Astrologer
          </label>
          <select
            id="target-user"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            disabled={submittingCredit}
            required
          >
            <option value="">-- Choose User --</option>
            {users.filter(u => u.role !== 'admin').map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) - Balance: {user.credits_balance || 0}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="add-credits">
            Credits to Add
          </label>
          <input
            id="add-credits"
            type="number"
            min="1"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            disabled={submittingCredit}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="allocation-reason">
            Reason / Reference
          </label>
          <input
            id="allocation-reason"
            type="text"
            placeholder="e.g. Monthly top-up for July"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={allocationReason}
            onChange={(e) => setAllocationReason(e.target.value)}
            disabled={submittingCredit}
            required
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button 
            type="button" 
            className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-neutral-50 rounded-lg cursor-pointer transition text-text-muted focus:outline-none" 
            onClick={onClose}
            disabled={submittingCredit}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-xs font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer border-none shadow-sm"
            disabled={submittingCredit}
          >
            {submittingCredit ? 'Processing...' : 'Confirm Allocation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
