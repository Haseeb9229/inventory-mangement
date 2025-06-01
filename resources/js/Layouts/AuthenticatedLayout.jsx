import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart2, Boxes, FileText, Home, Settings, Truck, Users, Warehouse } from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const isAdmin = user && user.roles && user.roles.includes('admin');

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const navigationItems = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            active: route().current('admin.dashboard'),
            icon: <Home className="w-6 h-6 text-blue-500" />,
        },
        {
            name: 'Users Management',
            href: route('admin.users.index'),
            active: route().current('admin.users.*'),
            icon: <Users className="w-6 h-6 text-indigo-500" />,
        },
        {
            name: 'Warehouses',
            href: route('admin.warehouses.index'),
            active: route().current('admin.warehouses.*'),
            icon: <Warehouse className="w-6 h-6 text-green-500" />,
        },
        {
            name: 'Inventory',
            href: route('admin.inventory.index'),
            active: route().current('admin.inventory.*'),
            icon: <Boxes className="w-6 h-6 text-yellow-500" />,
        },
        {
            name: 'Orders',
            href: '#',
            active: false,
            icon: <FileText className="w-6 h-6 text-orange-500" />,
        },
        {
            name: 'Suppliers',
            href: '#',
            active: false,
            icon: <Truck className="w-6 h-6 text-red-500" />,
        },
        {
            name: 'Reports',
            href: '#',
            active: false,
            icon: <BarChart2 className="w-6 h-6 text-purple-500" />,
        },
        {
            name: 'Settings',
            href: '#',
            active: false,
            icon: <Settings className="w-6 h-6 text-gray-500" />,
        },
    ];

    // Get current active navigation item
    const currentNavItem = navigationItems.find(item => item.active) || navigationItems[0];

    return (
        <div className="h-screen bg-gradient-to-br from-[#F5F5F5] via-[#E5E5E5] to-[#F0EBE3] flex overflow-hidden">
            {/* Mobile header */}
            {isAdmin && (
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-[#E8E6E1] shadow-sm flex items-center justify-between px-4 z-10">
                    <button
                        onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                        className="p-2 rounded-lg text-[#8B7355] hover:text-[#54483A] transition-colors duration-200"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showingNavigationDropdown ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    <div className="flex-1 flex justify-center">
                        <ApplicationLogo className="h-8" />
                    </div>
                    <div className="w-10"></div>
                </div>
            )}

            {/* Sidebar for admin */}
            {isAdmin && (
                <aside className={`w-72 h-full lg:relative fixed inset-y-0 left-0 z-50 transform ${
                    showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } transition-transform duration-300 ease-in-out`}>
                    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm border-r border-[#E8E6E1] shadow-xl pt-16 lg:pt-0">
                        <div className="h-20 flex items-center justify-center border-b border-[#E8E6E1] px-6 lg:flex hidden">
                            <ApplicationLogo className="h-12 w-auto" />
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-3 text-base font-medium rounded-lg
                                        transition-all duration-200 group
                                        ${
                                            item.active
                                                ? 'bg-[#E8D5C4] text-[#54483A] font-bold'
                                                : 'text-[#8B7355] hover:bg-[#F0EBE3] hover:text-[#54483A] hover:shadow-md'
                                        }
                                    `}
                                    onClick={() => setShowingNavigationDropdown(false)}
                                >
                                    <span className={`flex items-center transition-colors duration-200 mr-5 ${item.active ? '' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="ml-2 text-base font-semibold tracking-tight">
                                        {item.name}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                        {/* Logout section */}
                        <div className="px-3 py-4 border-t border-[#E8E6E1]">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg
                                    transition-all duration-200 group bg-gradient-to-r hover:from-[#A4907C] hover:to-[#8B7355]
                                    from-[#D5BEA4] to-[#C8B6A6] text-white shadow-md"
                            >
                                <span className="transition-colors duration-200 mr-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </span>
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Overlay for mobile */}
            {isAdmin && showingNavigationDropdown && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                ></div>
            )}

            {/* Main content area */}
            <div className="flex-1 h-full overflow-auto bg-gradient-to-br from-[#F5F5F5] via-[#E5E5E5] to-[#F0EBE3] lg:ml-0 pt-16 lg:pt-0">
                <main className="h-full">
                    <div className="p-8">
                        <h1 className="text-4xl font-bold mb-8 text-[#54483A] tracking-tight">
                            {currentNavItem.name}
                        </h1>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
