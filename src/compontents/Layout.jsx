import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from './SidebarContext';

const Layout = ({ children, onLogout }) => {
    const { isCollapsed } = useSidebar();
    
    return (
        <div className="flex min-h-screen bg-gray-50 relative">
            <Sidebar onLogout={onLogout} />
            <main className={`flex-1 transition-all duration-300 min-h-screen w-full overflow-x-hidden ${
                isCollapsed 
                    ? 'lg:ml-20' // 80px when collapsed
                    : 'lg:ml-72' // 288px when expanded
            }`}>
                <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
