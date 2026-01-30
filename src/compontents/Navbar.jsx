import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isOpen ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
            }`}>
                <span>{title}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                        {items.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Navbar = ({ onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileMenu, setActiveMobileMenu] = useState(null);
    const [adminData, setAdminData] = useState(null);

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
            items: [
                { label: 'Add Installment', href: '/installments/add' },
                { label: 'View  All', href: '/installments/all' },
                { label: 'Edit Installment', href: '/installments/update' },
                { label: 'Applications', href: '/installments/all-applications' },
            ]
        },
        {
            title: 'Loan',
            items: [
                { label: 'Add Loan', href: '/loan/add' },
                { label: 'View All Loans', href: '/loan/all' },
                { label: 'All Applications', href: '/loan/all-applications' },
            ]
        },
        {
            title: 'Property',
            items: [
                { label: 'Add Property', href: '/property/add' },
                { label: 'Update Property', href: '/property/update' },
                { label: 'View All', href: '/property/all' },
                { label: 'All Applications', href: '/property/all-applications' },
            ]
        },
        {
            title: 'Agents',
            items: [
                { label: 'View All', href: '/agent/all' },
                { label: 'Unverified Agents', href: '/agent/unverified' },
                { label: 'Assign Application', href: '/agent/assign' }
            ]
        },
        {
            title: 'Banners',
            items: [
                { label: 'Add Banner', href: '/banner/add' },
                { label: 'Manage All', href: '/banner/all' },
            ]
        },
        {
            title: 'Partners',
            items: [
                { label: 'Manage Partners', href: '/partners/all' },
            ]
        },
        {
            title: 'Commission',
            items: [
                { label: 'Commission Rules', href: '/commission/all' },
                { label: 'Commission Management', href: '/commission/management' },
                { label: 'Cases Management', href: '/cases/all' },
            ]
        },
        {
            title: 'Blog',
            items: [
                { label: 'Create Blog', href: '/blog/add' },
                { label: 'View All Blogs', href: '/blog/all' },
            ]
        },
        {
            title: 'Commission & Cases',
            items: [
                { label: 'Commission Rules', href: '/commission/all' },
                { label: 'Commission Management', href: '/commission/management' },
                { label: 'All Cases', href: '/cases/all' },
            ]
        }
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">Madadgaar</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/users" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors">
                            Users
                        </Link>
                        {navigationCategories.map((cat, idx) => (
                            <NavDropdown key={idx} title={cat.title} items={cat.items} />
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* Chat */}
                        <Link to="/chat" className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors relative">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </Link>

                        {/* Notifications */}
                        <Link to="/notifications" className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors relative">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                                    {adminData?.name ? adminData.name.substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">{adminData?.name || 'Admin'}</span>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 z-20">
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-xs text-gray-500">Signed in as</p>
                                            <p className="text-sm font-semibold text-gray-900 truncate">{adminData?.email || 'admin@madadgaar.com'}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                Profile
                                            </Link>
                                            <Link to="/update-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                Change Password
                                            </Link>
                                        </div>
                                        <div className="py-1 border-t border-gray-200">
                                            <button
                                                onClick={onLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50">
                            Dashboard
                        </Link>
                        <Link to="/users" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50">
                            Users
                        </Link>
                        {navigationCategories.map((cat, idx) => (
                            <div key={idx}>
                                <button
                                    onClick={() => setActiveMobileMenu(activeMobileMenu === idx ? null : idx)}
                                    className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                                >
                                    <span>{cat.title}</span>
                                    <svg className={`w-4 h-4 transition-transform ${activeMobileMenu === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {activeMobileMenu === idx && (
                                    <div className="pl-4 space-y-1 mt-1">
                                        {cat.items.map((item, i) => (
                                            <Link key={i} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50">
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
