import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, CreditCard, LogOut, Sparkles, BarChart3
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, profile }) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-card border-r border-border-subtle p-6 flex flex-col justify-between z-10">
      <div>
        <div className="flex items-center gap-2.5 text-text-main font-bold text-lg mb-8">
          <div className="p-1.5 bg-neutral-950 text-white rounded-lg">
            <Sparkles size={18} />
          </div>
          <span>Kundli Admin</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          {[
            { id: 'overview', label: 'Overview & Charts', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'orders', label: 'Kundli Orders Log', icon: FileText },
            { id: 'transactions', label: 'Transactions & Payments', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer text-left w-full border-none z-0 ${
                  isActive ? 'text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-neutral-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminTabIndicator"
                    className="absolute inset-0 bg-neutral-950 rounded-lg -z-10 shadow-premium"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-3 pt-4 border-t border-border-subtle mt-auto">
        <div className="w-9 h-9 bg-neutral-100 text-text-main rounded-full flex items-center justify-center font-semibold text-sm">
          {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'AD'}
        </div>
        <div className="flex-grow min-w-0">
          <div className="text-xs font-semibold text-text-main truncate">{profile?.email || 'admin@kundli.com'}</div>
          <div className="text-[10px] text-text-muted capitalize">{profile?.role || 'Administrator'}</div>
        </div>
        <button 
          onClick={onLogout} 
          className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition border-none bg-transparent" 
          title="Sign Out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
