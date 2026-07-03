import React from 'react';
import Modal from '../../Shared/Modal/Modal';

export default function EditUserModal({
  isOpen,
  onClose,
  handleUpdateUser,
  handleDeleteUser,
  editFullName,
  setEditFullName,
  editLoginUsername,
  setEditLoginUsername,
  editPassword,
  setEditPassword,
  submittingUser
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      description="Modify user details or reset their password."
    >
      <form onSubmit={handleUpdateUser} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="edit-username">
            Full Name
          </label>
          <input
            id="edit-username"
            type="text"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
            disabled={submittingUser}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="edit-username">
            Login Username
          </label>
          <input
            id="edit-username"
            type="text"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={editLoginUsername}
            onChange={(e) => setEditLoginUsername(e.target.value)}
            disabled={submittingUser}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="edit-password">
            New Password (Optional)
          </label>
          <input
            id="edit-password"
            type="password"
            placeholder="Leave blank to keep current password"
            className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            disabled={submittingUser}
            minLength={6}
          />
        </div>
        <div className="flex gap-3 justify-between pt-2">
          <button 
            type="button" 
            className="px-4 py-2 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition focus:outline-none" 
            onClick={handleDeleteUser}
            disabled={submittingUser}
          >
            Delete User
          </button>
          <div className="flex gap-3">
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
              {submittingUser ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
