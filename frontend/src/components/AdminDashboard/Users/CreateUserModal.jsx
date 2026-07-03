import React from 'react';
import Modal from '../../Shared/Modal/Modal';

export default function CreateUserModal({
  isOpen,
  onClose,
  handleCreateUser,
  newFullName,
  setNewFullName,
  newLoginUsername,
  setNewLoginUsername,
  newPassword,
  setNewPassword,
  submittingUser
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New User Account"
      description="Public registration is closed. Admins can initialize logins below."
    >
      <form onSubmit={handleCreateUser} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="new-name">
            Full Name
          </label>
          <input
            id="new-name"
            type="text"
            placeholder="John Doe"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
            required
            disabled={submittingUser}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="new-username">
            Login Username
          </label>
          <input
            id="new-username"
            type="text"
            placeholder="johndoe123"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={newLoginUsername}
            onChange={(e) => setNewLoginUsername(e.target.value)}
            required
            disabled={submittingUser}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="new-password">
            Password
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="At least 6 characters"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            disabled={submittingUser}
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button 
            type="button" 
            className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-neutral-50 rounded-lg cursor-pointer transition text-text-muted focus:outline-none" 
            onClick={onClose}
            disabled={submittingUser}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-xs font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer border-none shadow-sm"
            disabled={submittingUser}
          >
            {submittingUser ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
