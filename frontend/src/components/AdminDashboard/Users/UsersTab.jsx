import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function UsersTab({
  searchQuery,
  setSearchQuery,
  loading,
  filteredUsers,
  openEditModal
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="bg-white border border-border-subtle rounded-xl shadow-subtle p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center flex-grow max-w-sm">
          <Search className="absolute left-3 text-text-muted pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="Search users by username..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-border-subtle rounded-lg outline-none focus:border-neutral-900 bg-bg-card text-text-main"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-border-subtle rounded-lg overflow-hidden custom-scrollbar overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-border-subtle">
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider">User Account</th>
              <th className="font-semibold text-text-main p-3 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <tr>
                <td className="p-8 text-center text-text-muted">
                  Loading directory...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td className="p-8 text-center text-text-muted">
                  No registered accounts found matching query.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50">
                  <td className="p-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium text-text-main">{user.name || 'No Name'}</span>
                      <span className="text-xs text-text-muted">@{user.username}</span>
                      <span className="text-[10px] text-text-muted mt-0.5">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-3 py-1.5 text-xs font-semibold border border-border-subtle hover:bg-neutral-50 rounded-lg cursor-pointer transition text-text-main"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
