import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [data, setData] = useState(null);
    // // get user data from local storage 
    // const userData = JSON.parse(localStorage.getItem('adminAuth'));
    // useEffect(() => {
    //     setData(userData);
    // }, [userData]);


    return (
        <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isOpen ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
            >
                <span>{title}</span>
                <svg className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-1 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="py-2">
                        {items.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <span className="flex-1">{item.label}</span>
                                <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
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
            console.error("Failed to parse admin protocol:", error);
        }
    }, []);


    const navigationCategories = [
        {
            title: 'Installments',
            items: [
                { label: 'Add Installment', href: '/installments/add' },
                { label: 'Manage All', href: '/installments/all' },
                { label: 'Update Installment', href: '/installments/update' },
                { label: 'Applications', href: '/installments/all-applications' },

            ]
        },
        {
            title: 'Loan',
            items: [
                { label: 'Add Loan', href: '/loan/add' },
                { label: 'Update Loan', href: '/loan/update' },
                { label: 'View All', href: '/loan/all' },
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
            title: 'Banners & Sliders',
            items: [
                { label: 'Add Banner', href: '/banner/add' },
                { label: 'Manage Portfolio', href: '/banner/all' },
            ]
        },
        {
            title: 'Partners',
            items: [
                { label: 'Manage Partners', href: '/partners/all' },
            ]
        }
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Brand Section */}
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer mr-6">
                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-xl shadow-red-200">
                            <span className="text-white font-black text-2xl tracking-tighter">M</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent uppercase tracking-tighter">
                                Madadgaar
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1 flex-1">
                        <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all">
                            Dashboard
                        </Link>
                        {navigationCategories.map((cat, idx) => (
                            <NavDropdown key={idx} title={cat.title} items={cat.items} />
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-2">
                        {/* Desktop Search */}
                        {/* <div className="hidden md:flex relative group mr-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-40 lg:w-48 pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                                placeholder="Search..."
                            />
                        </div> */}

                        {/* Notifications */}
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all relative">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>

                        {/* User Profile */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 p-1 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-100 group"
                            >
                                {adminData?.profileImage ? (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-red-50 shadow-md">
                                        <img src={adminData.profileImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white font-black text-xs shadow-md group-hover:from-red-600 group-hover:to-red-700 transition-all">
                                        {adminData?.name ? adminData.name.substring(0, 2).toUpperCase() : 'AD'}
                                    </div>
                                )}
                                <div className="hidden md:block text-left pr-2">
                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight line-clamp-1">{adminData?.name || 'Administrator'}</p>
                                    <p className="text-[8px] font-bold text-red-600 uppercase tracking-widest">{adminData?.UserType || 'Operator'}</p>
                                </div>
                                <svg className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-3 w-64 rounded-[2rem] bg-white shadow-2xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-50 z-20 animate-in fade-in zoom-in duration-200 origin-top-right border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-5 bg-gray-50/50">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Operator ID</p>
                                            <p className="text-sm font-black text-gray-900 truncate mt-1">{adminData?.email || 'admin@madadgaar.com'}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" className="flex items-center px-6 py-3.5 text-[10px] font-black text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-widest">
                                                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                Profile
                                            </Link>
                                            <Link to="/update-password" className="flex items-center px-6 py-3.5 text-[10px] font-black text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-widest">
                                                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                                                Change Password
                                            </Link>
                                        </div>
                                        <div className="py-2">
                                            <button
                                                onClick={onLogout}
                                                className="flex w-full items-center px-6 py-4 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest"
                                            >
                                                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
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
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-300">
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            <Link to="/" className="block px-3 py-2 rounded-lg text-base font-medium text-red-600 bg-red-50">
                                Live Dashboard
                            </Link>
                            {navigationCategories.map((cat, idx) => (
                                <div key={idx} className="space-y-1">
                                    <button
                                        onClick={() => setActiveMobileMenu(activeMobileMenu === idx ? null : idx)}
                                        className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <span>{cat.title}</span>
                                        <svg className={`h-5 w-5 transition-transform duration-200 ${activeMobileMenu === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {activeMobileMenu === idx && (
                                        <div className="pl-4 space-y-1 animate-in slide-in-from-left duration-200">
                                            {cat.items.map((item, i) => (
                                                <Link key={i} to={item.href} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50">
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </nav >
    );
};

export default Navbar;
