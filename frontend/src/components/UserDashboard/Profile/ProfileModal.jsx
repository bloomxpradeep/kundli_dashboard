import React from 'react';
import Modal from '../../Shared/Modal/Modal';

export default function ProfileModal({ isOpen, onClose, profile, user }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
    >
      <div className="flex flex-col items-center justify-center py-6 text-center w-full">
        <div className="w-20 h-20 bg-neutral-950 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-premium mb-4 ring-4 ring-neutral-50">
          {(profile?.name || profile?.username || profile?.email || user?.email || 'US').substring(0, 2).toUpperCase()}
        </div>
        <h4 className="text-xl font-bold text-text-main mb-1">
          {profile?.name || profile?.email || user?.email}
        </h4>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-text-muted border border-border-subtle shadow-sm mb-6">
          {profile?.role === 'admin' ? 'Administrator' : 'Standard Account'}
        </span>

        {profile?.role !== 'admin' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-4 text-left px-2">
            <div className="bg-neutral-50 border border-border-subtle p-3 rounded-xl shadow-sm hover:shadow-subtle transition">
              <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Username</span>
              <span className="block font-medium text-text-main truncate" title={profile?.username}>{profile?.username || 'N/A'}</span>
            </div>
            <div className="bg-neutral-50 border border-border-subtle p-3 rounded-xl shadow-sm hover:shadow-subtle transition">
              <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Remaining Balance</span>
              <span className="block font-medium text-text-main font-semibold text-emerald-600">
                {profile?.credits_balance ?? '0'} Credits
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
