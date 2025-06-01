import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart2, Boxes, FileText, Home, Settings, Truck, Users, Warehouse, ShoppingCart, Package, RotateCcw, Layers, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const isAdmin = user && user.roles && user.roles.includes('admin');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(user.notifications || []);
    const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read_at).length);
    const notificationDropdownRef = useRef();

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
            name: 'Suppliers',
            href: route('admin.suppliers.index'),
            active: route().current('admin.suppliers.*'),
            icon: <Truck className="w-6 h-6 text-red-500" />,
        },
        {
            name: 'Categories',
            href: route('categories.index'),
            active: route().current('categories.*'),
            icon: <Layers className="w-6 h-6 text-green-600" />,
        },
        {
            name: 'Products',
            href: route('products.index'),
            active: route().current('products.*'),
            icon: <Package className="w-6 h-6 text-amber-500" />,
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
            name: 'Purchase Orders',
            href: route('admin.purchase-orders.index'),
            active: route().current('admin.purchase-orders.*'),
            icon: <ShoppingCart className="w-6 h-6 text-orange-500" />,
        },
        {
            name: 'Purchase Returns',
            href: route('admin.purchase-returns.index'),
            active: route().current('admin.purchase-returns.*'),
            icon: <RotateCcw className="w-6 h-6 text-violet-500" />,
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

    useEffect(() => {
        let channel;
        if (window.Echo && user) {
            channel = window.Echo.private(`App.Models.User.${user.id}`);
            channel.notification((notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(count => count + 1);
                toast.success('You have a new notification.');
            });
        }
        // Close dropdown on outside click
        const handleClickOutside = (event) => {
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            // Unsubscribe from Echo channel to prevent duplicate listeners
            if (channel && user) {
                window.Echo.leave(`private-App.Models.User.${user.id}`);
            }
        };
    }, [user]);

    // Utility to group notifications by date
    function groupNotificationsByDate(notifications) {
        const groups = {};
        notifications.forEach(n => {
            const date = n.at ? new Date(n.at) : new Date(n.created_at);
            let groupKey = format(date, 'yyyy-MM-dd');
            if (isToday(date)) groupKey = 'Today';
            else if (isYesterday(date)) groupKey = 'Yesterday';
            else groupKey = format(date, 'MMMM d, yyyy');
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(n);
        });
        return groups;
    }

    // Mark a single notification as read (frontend and backend)
    const handleNotificationClick = (id) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Use Inertia router.post for backend
        router.post(`/admin/notifications/${id}/read`, {}, { preserveScroll: true, preserveState: true });
    };

    // Mark all as read (frontend and backend)
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        setUnreadCount(0);
        // Use Inertia router.post for backend
        router.post('/admin/notifications/mark-all-read', {}, { preserveScroll: true, preserveState: true });
    };

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
                <aside className={`w-72 h-full lg:relative fixed inset-y-0 left-0 z-50 transform ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                                        ${item.active
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
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-4xl font-bold mb-8 text-[#54483A] tracking-tight">
                                {currentNavItem.name}
                            </h1>
                            {isAdmin && (
                                <div className="relative flex items-center gap-4">
                                    <button
                                        className="relative p-2 rounded-full hover:bg-[#F0EBE3] transition-colors duration-200"
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        title="Notifications"
                                    >
                                        <Bell className="w-6 h-6 text-[#8B7355]" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {showNotifications && (
                                        <div
                                            ref={notificationDropdownRef}
                                            className="absolute top-0 right-0 mt-2 w-96 bg-white border border-[#E8E6E1] rounded-lg shadow-2xl z-50 max-h-[32rem] overflow-y-auto"
                                        >
                                            <div className="p-4 border-b border-[#E8E6E1] font-bold text-[#54483A] flex items-center justify-between sticky top-0 bg-white z-20">
                                                <span>Notifications</span>
                                                {notifications.some(n => !n.read_at) && (
                                                    <button
                                                        className="text-xs text-blue-600 hover:underline"
                                                        onClick={markAllAsRead}
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            <ul>
                                                {notifications.length === 0 ? (
                                                    <li className="p-4 text-[#8B7355] text-center">No notifications</li>
                                                ) : (
                                                    (() => {
                                                        const grouped = groupNotificationsByDate(notifications);
                                                        const groupKeys = Object.keys(grouped);
                                                        return groupKeys.map(dateKey => (
                                                            <div key={dateKey} className="mb-2">
                                                                <div className="px-4 py-2 bg-[#F0EBE3] text-xs font-bold text-[#8B7355] sticky top-0 z-10 rounded-t">
                                                                    {dateKey}
                                                                </div>
                                                                {grouped[dateKey]
                                                                    .sort((a, b) => (b.at || b.created_at) > (a.at || a.created_at) ? 1 : -1)
                                                                    .map((n, idx) => (
                                                                        <li
                                                                            key={n.id || idx}
                                                                            onClick={() => handleNotificationClick(n.id)}
                                                                            className={`cursor-pointer flex items-start gap-2 px-4 py-3 border-b border-[#E8E6E1] ${!n.read_at ? 'bg-[#FFF7ED]' : 'bg-white opacity-80'}`}
                                                                        >
                                                                            {!n.read_at && (
                                                                                <span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block flex-shrink-0"></span>
                                                                            )}
                                                                            <div className="flex-1">
                                                                                <div className="font-semibold text-[#B85C38]">{n.title}</div>
                                                                                <div className="text-[#54483A] text-sm">{n.message}</div>
                                                                                <div className="text-xs text-[#8B7355] mt-1">
                                                                                    {n.at ? new Date(n.at).toLocaleString() : ''}
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                            </div>
                                                        ));
                                                    })()
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
