import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="relative">
            <input
              id="edit-password"
              type={showPassword ? "text" : "password"}
              placeholder="Leave blank to keep current password"
              className="w-full pl-3 pr-10 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              minLength={6}
              disabled={submittingUser}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
