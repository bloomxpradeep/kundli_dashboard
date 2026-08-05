import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertOctagon, Save } from 'lucide-react';
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
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setConfirmAction(null);
  }, [isOpen]);

  const handleClose = () => {
    setConfirmAction(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit User"
      description="Modify user details or reset their password."
    >
      {confirmAction === 'delete' ? (
        <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-100">
            <AlertOctagon size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">Delete User?</h3>
          <p className="text-sm text-text-muted mb-6 px-4">
            Are you sure you want to permanently delete <strong>{editFullName}</strong> ({editLoginUsername})? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full justify-center">
            <button 
              onClick={() => setConfirmAction(null)} 
              className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-neutral-50 rounded-lg cursor-pointer transition text-text-muted focus:outline-none"
              disabled={submittingUser}
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteUser} 
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer border-none shadow-sm flex items-center gap-2"
              disabled={submittingUser}
            >
              {submittingUser ? 'Deleting...' : 'Yes, Delete User'}
            </button>
          </div>
        </div>
      ) : confirmAction === 'update' ? (
        <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-neutral-200">
            <Save size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">Save Changes?</h3>
          <p className="text-sm text-text-muted mb-6 px-4">
            You are about to modify the details for <strong>{editFullName}</strong>. 
            {editPassword ? ' Their password will also be reset.' : ''}
          </p>
          <div className="flex gap-3 w-full justify-center">
            <button 
              onClick={() => setConfirmAction(null)} 
              className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-neutral-50 rounded-lg cursor-pointer transition text-text-muted focus:outline-none"
              disabled={submittingUser}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdateUser} 
              className="px-4 py-2 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg transition cursor-pointer border-none shadow-sm flex items-center gap-2"
              disabled={submittingUser}
            >
              {submittingUser ? 'Saving...' : 'Yes, Save Changes'}
            </button>
          </div>
        </div>
      ) : (
      <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('update'); }} className="space-y-4">
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
            onClick={() => setConfirmAction('delete')}
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
      )}
    </Modal>
  );
}
