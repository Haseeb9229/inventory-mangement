import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

const icons = {
    users: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 4v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" />
        </svg>
    ),
    warehouses: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-7 9 7v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V9h6v12" />
        </svg>
    ),
    inventory: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect width="20" height="14" x="2" y="7" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" />
        </svg>
    ),
    orders: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    suppliers: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    ),
    lowStock: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    outOfStock: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
        </svg>
    ),
    pendingOrders: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    completedOrders: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4" />
        </svg>
    ),
    categories: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect width="6" height="6" x="4" y="4" rx="1" />
            <rect width="6" height="6" x="14" y="4" rx="1" />
            <rect width="6" height="6" x="4" y="14" rx="1" />
            <rect width="6" height="6" x="14" y="14" rx="1" />
        </svg>
    ),
    inventoryValue: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4" />
        </svg>
    ),
    topSelling: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
};

export default function Dashboard() {
    const { statsData } = usePage().props;

    const stats = [
        { name: 'Total Users', value: statsData.users_count, icon: icons.users },
        { name: 'Warehouses', value: statsData.warehouses_count, icon: icons.warehouses },
        { name: 'Inventory Items', value: statsData.inventory_items_count, icon: icons.inventory },
        { name: 'Total Orders', value: statsData.orders_count, icon: icons.orders },
        { name: 'Suppliers', value: statsData.suppliers_count, icon: icons.suppliers },
        { name: 'Low Stock Items', value: statsData.low_stock_items_count, icon: icons.lowStock },
        { name: 'Out of Stock', value: statsData.out_of_stock_items_count, icon: icons.outOfStock },
        { name: 'Pending Orders', value: statsData.pending_orders_count, icon: icons.pendingOrders },
        { name: 'Completed Orders', value: statsData.completed_orders_count, icon: icons.completedOrders },
        { name: 'Categories', value: statsData.categories_count, icon: icons.categories },
        { name: 'Inventory Value', value: statsData.inventory_value, icon: icons.inventoryValue },
        { name: 'Top Selling Products', value: statsData.top_selling_count, icon: icons.topSelling }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="h-full">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 sm:p-4 md:p-6 flex flex-col items-center group hover:-translate-y-1 border border-[#E8E6E1]"
                        >
                            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-gradient-to-br from-[#D5BEA4] to-[#E8D5C4] group-hover:from-[#C8B6A6] group-hover:to-[#A4907C] transition-colors duration-300">
                                <div className="text-white">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="mt-2 sm:mt-3 md:mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#54483A] text-center break-words w-full">
                                {stat.value}
                            </div>
                            <div className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-[#8B7355] font-medium text-center">
                                {stat.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
