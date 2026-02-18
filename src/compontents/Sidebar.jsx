import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';

// Modern Icon Components
const DashboardIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ChevronDownIcon = ({ className = "" }) => (
    <svg className={`w-4 h-4 transition-transform duration-200 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CollapseIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
);

const ExpandIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

// Category Icons
const InstallmentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const LoanIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PropertyIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const AgentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const BannerIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const InsuranceIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const PartnerIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CommissionIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BlogIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const SystemIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const Sidebar = ({ onLogout }) => {
    const location = useLocation();
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const [adminData, setAdminData] = useState(null);
    const [openCategories, setOpenCategories] = useState({});
    const [isAccountSliderOpen, setIsAccountSliderOpen] = useState(false);

    useEffect(() => {
        try {
            const auth = JSON.parse(localStorage.getItem('adminAuth'));
            if (auth && auth.user) {
                setAdminData(auth.user);
            }
        } catch (error) {
            console.error("Failed to parse admin data:", error);
        }
    }, []);

    const navigationCategories = [
        {
            title: 'Installments',
            icon: <InstallmentIcon />,
            items: [
                { label: 'Add Installment', href: '/installments/add' },
                { label: 'View All', href: '/installments/all' },
                { label: 'Edit Installment', href: '/installments/update' },
                { label: 'Applications', href: '/installments/all-applications' },
            ]
        },
        {
            title: 'Loan',
            icon: <LoanIcon />,
            items: [
                { label: 'Add Loan', href: '/loan/add' },
                { label: 'View All Loans', href: '/loan/all' },
                { label: 'All Applications', href: '/loan/all-applications' },
            ]
        },
        {
            title: 'Property',
            icon: <PropertyIcon />,
            items: [
                { label: 'Add Property', href: '/property/add' },
                { label: 'Update Property', href: '/property/update' },
                { label: 'View All', href: '/property/all' },
                { label: 'All Applications', href: '/property/all-applications' },
            ]
        },
        {
            title: 'Agents',
            icon: <AgentIcon />,
            items: [
                { label: 'View All', href: '/agent/all' },
                { label: 'Assignment Details', href: '/agent/assign' },
                { label: 'Withdrawal Requests', href: '/agent/withdrawals' },
                { label: 'Unverified Agents', href: '/agent/unverified' },
            ]
        },
        {
            title: 'Banners',
            icon: <BannerIcon />,
            items: [
                { label: 'Add Banner', href: '/banner/add' },
                { label: 'Manage All', href: '/banner/all' },
            ]
        },
        {
            title: 'Insurance',
            icon: <InsuranceIcon />,
            items: [
                { label: 'Create Plan', href: '/insurance/add' },
                { label: 'View All Plans', href: '/insurance/all' },
                { label: 'All Applications', href: '/insurance/applications' },
                { label: 'Claims & Maturity', href: '/insurance/claims' },
            ]
        },
        {
            title: 'Partners',
            icon: <PartnerIcon />,
            items: [
                { label: 'Manage Partners', href: '/partners/all' },
            ]
        },
        {
            title: 'Commission',
            icon: <CommissionIcon />,
            items: [
                { label: 'Commission Rules', href: '/commission/all' },
                { label: 'Commission Management', href: '/commission/management' },
                { label: 'Cases Management', href: '/cases/all' },
            ]
        },
        {
            title: 'Blog',
            icon: <BlogIcon />,
            items: [
                { label: 'Create Blog', href: '/blog/add' },
                { label: 'View All Blogs', href: '/blog/all' },
            ]
        },
        {
            title: 'System',
            icon: <SystemIcon />,
            items: [
                { label: 'System Health', href: '/system/health' },
                { label: 'Tax Settings', href: '/system/tax-settings' },
                { label: 'Bulk Email', href: '/bulk-email' },
            ]
        }
    ];

    const toggleCategory = (title) => {
        setOpenCategories(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // Handle link click - collapse sidebar on mobile
    const handleLinkClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsCollapsed(true);
        }
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const isCategoryActive = (items) => {
        return items.some(item => isActive(item.href));
    };

    // Auto-open category if it contains active route
    useEffect(() => {
        navigationCategories.forEach(cat => {
            if (isCategoryActive(cat.items) && !openCategories[cat.title]) {
                setOpenCategories(prev => ({ ...prev, [cat.title]: true }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
        <>
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Modern Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40
                transition-all duration-300 ease-in-out
                ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}
                flex flex-col shadow-2xl overflow-hidden
            `}>
                {/* Modern Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-red-600 to-red-700 h-20">
                    {!isCollapsed ? (
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:bg-white/30 transition-all duration-200">
                                <span className="text-white font-bold text-2xl">M</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white block">Madadgaar</span>
                                <span className="text-xs text-red-100">Admin Panel</span>
                            </div>
                        </Link>
                    ) : (
                        <Link to="/" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto shadow-lg hover:bg-white/30 transition-all duration-200">
                            <span className="text-white font-bold text-2xl">M</span>
                        </Link>
                    )}
                    
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                        aria-label="Close sidebar"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Collapse Button - Desktop Only */}
                {!isCollapsed && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:text-red-600 transition-all duration-200 border border-gray-200 hover:border-red-200 hover:shadow-sm"
                            title="Collapse sidebar"
                        >
                            <span>Collapse Menu</span>
                            <CollapseIcon />
                        </button>
                    </div>
                )}

                {/* Navigation - Main Section */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
                    {/* Main Navigation */}
                    {!isCollapsed && (
                        <div className="px-3 mb-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</p>
                        </div>
                    )}
                    
                    {/* Dashboard */}
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        className={`
                            group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive('/') && location.pathname === '/' 
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20' 
                                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:shadow-sm'
                            }
                        `}
                        title={isCollapsed ? 'Dashboard' : ''}
                    >
                        <div className={isActive('/') && location.pathname === '/' ? 'text-white' : 'text-gray-400 group-hover:text-red-600'}>
                            <DashboardIcon />
                        </div>
                        {!isCollapsed && <span className="font-semibold">Dashboard</span>}
                    </Link>

                    {/* Users */}
                    <Link
                        to="/users"
                        onClick={handleLinkClick}
                        className={`
                            group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive('/users') 
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20' 
                                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:shadow-sm'
                            }
                        `}
                        title={isCollapsed ? 'Users' : ''}
                    >
                        <div className={isActive('/users') ? 'text-white' : 'text-gray-400 group-hover:text-red-600'}>
                            <UsersIcon />
                        </div>
                        {!isCollapsed && <span className="font-semibold">Users</span>}
                    </Link>

                    {/* Divider */}
                    {!isCollapsed && (
                        <div className="my-4 px-3">
                            <div className="border-t border-gray-100"></div>
                        </div>
                    )}
                    
                    {/* Categories Section */}
                    {!isCollapsed && (
                        <div className="px-3 mb-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</p>
                        </div>
                    )}

                    {/* Categories */}
                    {navigationCategories.map((cat) => {
                        const isOpen = openCategories[cat.title];
                        const hasActive = isCategoryActive(cat.items);

                        return (
                            <div key={cat.title} className="mb-1">
                                <button
                                    onClick={() => !isCollapsed && toggleCategory(cat.title)}
                                    className={`
                                        group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${hasActive 
                                            ? 'bg-red-50 text-red-600 border border-red-100' 
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                        }
                                    `}
                                    title={isCollapsed ? cat.title : ''}
                                >
                                    <div className={hasActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}>
                                        {cat.icon}
                                    </div>
                                    {!isCollapsed && (
                                        <>
                                            <span className="font-semibold flex-1 text-left">{cat.title}</span>
                                            <ChevronDownIcon className={isOpen ? 'rotate-180' : ''} />
                                        </>
                                    )}
                                </button>

                                {/* Submenu */}
                                {!isCollapsed && isOpen && (
                                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-red-100 pl-4">
                                        {cat.items.map((item, idx) => {
                                            const itemIsActive = isActive(item.href);
                                            return (
                                                <Link
                                                    key={idx}
                                                    to={item.href}
                                                    onClick={handleLinkClick}
                                                    className={
                                                        itemIsActive
                                                            ? 'block px-4 py-2.5 rounded-lg transition-all text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                                                            : 'block px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:pl-5'
                                                    }
                                                >
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer - Account Button */}
                <div className="border-t-2 border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4 flex-shrink-0">
                    {!isCollapsed ? (
                        <button
                            onClick={() => setIsAccountSliderOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:text-red-600 transition-all duration-200 hover:shadow-sm bg-white shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg">
                                {adminData?.name ? adminData.name.substring(0, 2).toUpperCase() : 'AD'}
                            </div>
                            <div className="flex-1 min-w-0 text-left overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {adminData?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {adminData?.email || 'admin@madadgaar.com.pk'}
                                </p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => setIsAccountSliderOpen(true)}
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                                title="Account"
                            >
                                {adminData?.name ? adminData.name.substring(0, 2).toUpperCase() : 'AD'}
                            </button>
                            <button
                                onClick={() => setIsCollapsed(false)}
                                className="p-2.5 rounded-xl text-gray-600 hover:text-red-600 hover:bg-white transition-all duration-200 hover:shadow-sm"
                                title="Expand sidebar"
                            >
                                <ExpandIcon />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Menu Toggle Button */}
            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="fixed top-4 left-4 z-30 lg:hidden p-3 bg-white rounded-xl shadow-xl border border-gray-200 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-2xl"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            )}

            {/* Account Slider/Drawer */}
            {isAccountSliderOpen && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
                        onClick={() => setIsAccountSliderOpen(false)}
                    />
                    
                    {/* Slider */}
                    <div className={`
                        fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-[70]
                        transition-transform duration-300 ease-in-out
                        ${isAccountSliderOpen ? 'translate-x-0' : 'translate-x-full'}
                        flex flex-col
                    `}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-red-600 to-red-700">
                            <h2 className="text-xl font-bold text-white">Account</h2>
                            <button
                                onClick={() => setIsAccountSliderOpen(false)}
                                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                                aria-label="Close account slider"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                            {/* Profile Info */}
                            <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                                    {adminData?.name ? adminData.name.substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                <p className="text-lg font-bold text-gray-900 mb-1">
                                    {adminData?.name || 'Admin'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {adminData?.email || 'admin@madadgaar.com.pk'}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <Link
                                    to="/profile"
                                    onClick={() => {
                                        setIsAccountSliderOpen(false);
                                        handleLinkClick();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:shadow-sm border border-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    to="/update-password"
                                    onClick={() => {
                                        setIsAccountSliderOpen(false);
                                        handleLinkClick();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:shadow-sm border border-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Change Password</span>
                                </Link>
                                <Link
                                    to="/notifications"
                                    onClick={() => {
                                        setIsAccountSliderOpen(false);
                                        handleLinkClick();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:shadow-sm border border-gray-100 relative"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <span>Notifications</span>
                                    <span className="absolute left-7 top-3.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                </Link>
                                <Link
                                    to="/chat"
                                    onClick={() => {
                                        setIsAccountSliderOpen(false);
                                        handleLinkClick();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:shadow-sm border border-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Chat</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsAccountSliderOpen(false);
                                        onLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-2 border-red-200 hover:border-red-300 hover:shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Sidebar;
