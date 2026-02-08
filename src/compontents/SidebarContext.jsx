import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            // On mobile, always start collapsed
            if (window.innerWidth < 1024) {
                return true;
            }
            // On desktop, check localStorage
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved === 'true';
        }
        return false;
    });

    // Update localStorage when state changes (desktop only)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
        }
    }, [isCollapsed]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            } else {
                // Restore saved state on desktop
                const saved = localStorage.getItem('sidebarCollapsed');
                if (saved !== null) {
                    setIsCollapsed(saved === 'true');
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
};
