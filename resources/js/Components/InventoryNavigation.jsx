import { Link } from '@inertiajs/react';

export default function InventoryNavigation() {
    const tabs = [
        {
            name: 'All Inventory',
            href: route('admin.inventory.index'),
            active: route().current('admin.inventory.index'),
        },
        {
            name: 'In Stock',
            href: route('admin.inventory.in-stock'),
            active: route().current('admin.inventory.in-stock'),
        },
        {
            name: 'Low Stock',
            href: route('admin.inventory.low-stock'),
            active: route().current('admin.inventory.low-stock'),
        },
        {
            name: 'Out of Stock',
            href: route('admin.inventory.out-of-stock'),
            active: route().current('admin.inventory.out-of-stock'),
        },
        {
            name: 'Movements',
            href: route('admin.inventory.movements'),
            active: route().current('admin.inventory.movements'),
        },
    ];

    return (
        <div className="mb-6">
            <div className="border-b border-[#E8E6E1]">
                <nav className="mb-6">
                    <div className="flex gap-2 px-4">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200
                                    ${tab.active ? 'text-[#B85C38] border-b-2 border-[#B85C38] bg-white shadow' : 'text-[#8B7355] hover:text-[#B85C38]'}
                                    focus:outline-none focus:ring-2 focus:ring-[#B85C38]
                                `}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}
