import React from 'react';
import { Coins, FileText, PieChartIcon, Sparkles, User, History, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  showDropdown, 
  setShowDropdown, 
  setIsProfileModalOpen, 
  onLogout, 
  profile, 
  user 
}) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-card border-r border-r-border-subtle p-6 flex flex-col justify-between z-10">
      <div>
        <div className="flex items-center gap-2.5 text-text-main font-bold text-lg mb-8">
          <div className="p-1.5 bg-neutral-950 text-white rounded-lg">
            <Sparkles size={18} />
          </div>
          <span>Kundli Portal</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Coins },
            { id: 'orders', label: 'Orders', icon: FileText },
            { id: 'analytics', label: 'Order Analysis', icon: PieChartIcon },
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
                    layoutId="activeTabIndicator"
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
      
      <div id="user-menu-container" className="relative mt-auto">
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-card border border-border-subtle rounded-lg shadow-premium p-1.5 z-20 flex flex-col gap-0.5 animate-modal">
            <button 
              onClick={() => {
                setIsProfileModalOpen(true);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 rounded-md font-medium text-text-main transition border-none cursor-pointer flex items-center gap-2 bg-transparent"
            >
              <User size={13} className="text-text-muted" />
              <span>User Detail</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('credits');
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 rounded-md font-medium text-text-main transition border-none cursor-pointer flex items-center gap-2 bg-transparent"
            >
              <History size={13} className="text-text-muted" />
              <span>Credit Log</span>
            </button>
            <div className="h-[1px] bg-border-subtle my-1"></div>
            <button 
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-red-600 rounded-md font-medium text-text-muted transition border-none cursor-pointer flex items-center gap-2 bg-transparent"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Clickable Profile Trigger */}
        <div 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 pt-4 border-t border-t-border-subtle cursor-pointer hover:bg-neutral-50/50 p-1.5 -mx-1.5 rounded-lg transition"
        >
          <div className="w-8 h-8 bg-neutral-100 text-text-main rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {profile?.name ? profile.name.substring(0, 2).toUpperCase() : (profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'US')}
          </div>
          <div className="flex-grow min-w-0">
            <div className="text-xs font-semibold text-text-main truncate leading-tight">{profile?.name || user?.name || 'Astrologer'}</div>
            <div className="text-[10px] text-text-muted leading-none mt-0.5 font-normal">{profile?.username || user?.username || 'User Account'}</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }} 
            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition border-none bg-transparent flex-shrink-0" 
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
