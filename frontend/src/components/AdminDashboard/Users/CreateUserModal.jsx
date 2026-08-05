import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setConfirmAction(null);
  }, [isOpen]);

  // When modal closes, reset confirm state
  const handleClose = () => {
    setConfirmAction(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User Account"
      description="Public registration is closed. Admins can initialize logins below."
    >
      {confirmAction === 'create' ? (
        <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
            <UserPlus size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">Confirm Creation</h3>
          <p className="text-sm text-text-muted mb-6 px-4">
            You are about to create a new staff account for <strong>{newFullName || 'this user'}</strong>. They will be able to log in immediately.
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
              onClick={handleCreateUser} 
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer border-none shadow-sm flex items-center gap-2"
              disabled={submittingUser}
            >
              {submittingUser ? 'Creating...' : 'Yes, Create User'}
            </button>
          </div>
        </div>
      ) : (
      <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('create'); }} className="space-y-4">
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
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className="w-full pl-3 pr-10 py-2 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main outline-none focus:border-neutral-900"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
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
      )}
    </Modal>
  );
}
