import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigation from '@/Components/InventoryNavigation';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import debounce from 'lodash/debounce';
import { ArrowDownCircle, ArrowUpCircle, Repeat, Wrench, Undo2, Redo2 } from 'lucide-react';
import React from 'react';

export default function Movements({ movements = { data: [], links: [], from: 0, to: 0, total: 0 }, filters = { search: '', warehouse_id: '', type: '' }, warehouses = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState(filters.warehouse_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');

    const debouncedSearch = debounce((value) => {
        router.get(route('admin.inventory.movements'), {
            search: value,
            warehouse_id: selectedWarehouse,
            type: selectedType
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 300);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleWarehouseChange = (e) => {
        setSelectedWarehouse(e.target.value);
        router.get(route('admin.inventory.movements'), {
            search: search,
            warehouse_id: e.target.value,
            type: selectedType
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        router.get(route('admin.inventory.movements'), {
            search: search,
            warehouse_id: selectedWarehouse,
            type: e.target.value
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const movementTypes = [
        { value: '', label: 'All Types' },
        { value: 'in', label: 'Stock In' },
        { value: 'out', label: 'Stock Out' },
        { value: 'move', label: 'Transfer' },
        { value: 'adjustment', label: 'Adjustment' },
        { value: 'purchase_return', label: 'Purchase Return' },
        { value: 'sale_return', label: 'Sale Return' }
    ];

    const movementTypeLabels = {
        in: 'Stock In',
        out: 'Stock Out',
        move: 'Transfer',
        adjustment: 'Adjustment',
        purchase_return: 'Purchase Return',
        sale_return: 'Sale Return',
    };

    const movementTypeIcons = {
        in: <ArrowDownCircle className="w-4 h-4 mr-1" />,
        out: <ArrowUpCircle className="w-4 h-4 mr-1" />,
        move: <Repeat className="w-4 h-4 mr-1" />,
        adjustment: <Wrench className="w-4 h-4 mr-1" />,
        purchase_return: <Undo2 className="w-4 h-4 mr-1" />,
        sale_return: <Redo2 className="w-4 h-4 mr-1" />,
    };

    const movementTypeGradients = {
        in: 'from-emerald-100 to-emerald-300 text-emerald-900',
        out: 'from-rose-100 to-rose-300 text-rose-900',
        move: 'from-sky-100 to-sky-300 text-sky-900',
        adjustment: 'from-amber-100 to-amber-300 text-amber-900',
        purchase_return: 'from-violet-100 to-violet-300 text-violet-900',
        sale_return: 'from-pink-100 to-pink-300 text-pink-900',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory Movements" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-8">
                    <div className="bg-white/80 backdrop-blur-sm overflow-x-auto shadow-xl rounded-lg">
                        <div className="p-6 min-w-[600px]">
                            <InventoryNavigation />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                                <h1 className="text-2xl font-bold text-[#54483A]">Inventory Movements</h1>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end">
                                    <div className="relative w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={search}
                                            onChange={handleSearch}
                                            className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </span>
                                    </div>
                                    <select
                                        value={selectedWarehouse}
                                        onChange={handleWarehouseChange}
                                        className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm"
                                    >
                                        <option value="">All Warehouses</option>
                                        {warehouses.map(warehouse => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedType}
                                        onChange={handleTypeChange}
                                        className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm"
                                    >
                                        {movementTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E8E6E1] mx-auto">
                                    <thead>
                                        <tr className="bg-[#F5F5F5]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Source Warehouse
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Destination Warehouse
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Reference
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Created By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Notes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {movements.data.map((movement) => (
                                            <tr key={movement.id} className="hover:bg-[#F0EBE3] transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">
                                                        {new Date(movement.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-[#54483A]">
                                                        {movement.product.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{movement.source_warehouse?.name || '—'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{movement.destination_warehouse?.name || '—'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`
                                                        inline-flex items-center gap-1 px-3 py-1 rounded-full shadow-sm font-semibold text-xs
                                                        bg-gradient-to-r ${movementTypeGradients[movement.type] || 'from-gray-200 to-gray-400 text-gray-800'}
                                                        border border-white/30
                                                    `}>
                                                        {movementTypeIcons[movement.type]}
                                                        {movementTypeLabels[movement.type] || movement.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{movement.quantity}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{movement.reference || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{movement.creator?.name || 'System'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{movement.notes || '—'}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-[#8B7355]">
                                        Showing {movements.from} to {movements.to} of {movements.total} items
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {movements.links.map((link, index) => {
                                            // Skip rendering the middle "..." link
                                            if (link.label.includes("...")) {
                                                return <span key={index} className="px-3 py-2 text-[#8B7355]">{link.label}</span>;
                                            }

                                            // Special styling for Previous/Next buttons
                                            const isPrevNext = link.label.includes('Previous') || link.label.includes('Next');

                                            return (
                                                <button
                                                    key={index}
                                                    className={`
                                                        ${isPrevNext ? 'px-4' : 'px-3'}
                                                        py-2
                                                        rounded-lg
                                                        text-sm
                                                        font-medium
                                                        transition-all
                                                        duration-200
                                                        ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                                                        ${link.active
                                                            ? 'bg-gradient-to-r from-[#B85C38] to-[#E2725B] text-white shadow-md'
                                                            : link.url
                                                                ? 'bg-white hover:bg-gradient-to-r hover:from-[#D5BEA4] hover:to-[#E8D5C4] text-[#8B7355] hover:text-white border border-[#E8E6E1]'
                                                                : 'bg-[#F5F5F5] text-[#8B7355] border border-[#E8E6E1]'
                                                        }
                                                        ${isPrevNext ? 'flex items-center gap-1' : ''}
                                                    `}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                >
                                                    {isPrevNext ? (
                                                        <>
                                                            {link.label.includes('Previous') && (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                                </svg>
                                                            )}
                                                            {link.label.replace('&laquo; ', '').replace(' &raquo;', '')}
                                                            {link.label.includes('Next') && (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
