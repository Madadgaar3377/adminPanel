import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from './SidebarContext';

const Layout = ({ children, onLogout }) => {
    const { isCollapsed } = useSidebar();

    const handleRefresh = () => window.location.reload();

    return (
        <div className="flex min-h-screen bg-gray-50 relative">
            <Sidebar onLogout={onLogout} />
            <main className={`flex-1 transition-all duration-300 min-h-screen w-full overflow-x-hidden flex flex-col ${
                isCollapsed 
                    ? 'lg:ml-20' // 80px when collapsed
                    : 'lg:ml-72' // 288px when expanded
            }`}>
                {/* Top bar with refresh - visible on all pages */}
                <header className="sticky top-0 z-10 flex items-center justify-end h-14 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm shrink-0">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                        title="Refresh page"
                        aria-label="Refresh page"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline text-sm font-medium">Refresh</span>
                    </button>
                </header>
                <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
