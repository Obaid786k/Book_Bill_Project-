import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Topbar = ({ onOpenSidebar }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const displayName = user?.name || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="h-[50px] bg-navy-dk text-paper flex items-center justify-between px-[22px] sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.25)] relative no-print">
      <div className="flex items-center">
        <button 
          onClick={onOpenSidebar}
          className="md:hidden text-paper hover:text-white/80 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Search Placeholder - Centered */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center bg-white/10 rounded-md px-3 py-1.5 border border-white/[.18] cursor-not-allowed">
        <Search size={14} className="text-white/40 mr-2" />
        <input 
          type="text" 
          placeholder="Search — coming soon" 
          disabled
          className="bg-transparent border-none text-[12.5px] text-white/60 focus:outline-none placeholder:text-white/60 w-[250px] cursor-not-allowed"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/notifications')}
          className="text-paper hover:text-white/80 transition-colors relative"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 bg-gold text-navy text-[9px] font-bold px-1 rounded-full">!</span>
        </button>
        <button className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors">
          <div className="flex items-center justify-center bg-gold text-white shadow-sm font-bold text-[11px] rounded-full w-7 h-7">
            {initials}
          </div>
          <span className="text-[13px] font-medium hidden sm:block">{displayName}</span>
        </button>
      </div>
    </header>
  );
};
