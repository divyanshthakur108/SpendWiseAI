import React from 'react';
import SearchBar from './SearchBar';
import NotificationButton from './NotificationButton';
import ProfileDropdown from './ProfileDropdown';
import { Menu } from 'lucide-react';

const Navbar = ({ setMobileOpen }) => {
  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left Group: Mobile Drawer Toggle & SearchBar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-[#334155] hover:text-[#DC2626] hover:bg-[#F1F5F9] transition-colors"
          aria-label="Open sidebar drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <SearchBar />
      </div>

      {/* Right Group: Notifications & Profile Dropdown */}
      <div className="flex items-center space-x-3">
        <NotificationButton />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Navbar;
