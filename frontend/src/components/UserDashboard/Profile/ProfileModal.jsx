import React from 'react';
import Modal from '../../Shared/Modal/Modal';

export default function ProfileModal({ isOpen, onClose, profile, user }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Detail"
      description="Review your secure account attributes and credentials."
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-neutral-950 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
          {profile?.email ? profile.email.substring(0, 2).toUpperCase() : 'US'}
        </div>
        <div>
          <h4 className="text-base font-bold text-text-main">{profile?.email || user.email}</h4>
          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-text-muted border border-border-subtle">
            Standard Account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle text-xs">
        <div>
          <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Account ID</span>
          <span className="block font-mono text-text-main break-all">{profile?.id || user.id}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Member Since</span>
          <span className="block font-medium text-text-main">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </Modal>
  );
}
