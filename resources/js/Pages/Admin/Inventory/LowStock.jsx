import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigation from '@/Components/InventoryNavigation';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Boxes, AlertTriangle, AlertCircle, Truck, History, Wrench } from 'lucide-react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import debounce from 'lodash/debounce';

// Custom toast styles
const toastStyles = {
    style: {
        background: '#fff',
        color: '#54483A',
        border: '1px solid #E8E6E1',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
    },
    success: {
        iconTheme: {
            primary: '#4A6741',
            secondary: '#fff',
        },
        style: {
            borderLeft: '4px solid #4A6741',
        },
    },
    error: {
        iconTheme: {
            primary: '#B85C38',
            secondary: '#fff',
        },
        style: {
            borderLeft: '4px solid #B85C38',
        },
    },
};

export default function LowStock({ inventory = { data: [], links: [], from: 0, to: 0, total: 0 }, filters = { search: '', warehouse_id: '' }, warehouses = [] }) {
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState(filters.warehouse_id || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        quantity: '',
        notes: '',
    });

    const debouncedSearch = debounce((value) => {
        router.get(route('admin.inventory.low-stock'), {
            search: value,
            warehouse_id: selectedWarehouse
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
        router.get(route('admin.inventory.low-stock'), {
            search: search,
            warehouse_id: e.target.value
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openAdjustmentModal = (item) => {
        setSelectedItem(item);
        setData({
            quantity: item.quantity,
            notes: '',
        });
        setShowAdjustmentModal(true);
    };

    const closeAdjustmentModal = () => {
        setShowAdjustmentModal(false);
        setSelectedItem(null);
        reset();
    };

    const handleAdjustment = (e) => {
        e.preventDefault();
        post(route('admin.inventory.adjust', selectedItem.id), {
            onSuccess: () => {
                closeAdjustmentModal();
                toast.success('Inventory adjusted successfully!', toastStyles);
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please check the form for errors', toastStyles);
                }
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Low Stock Inventory" />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    className: 'font-medium',
                }}
            />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-8">
                    <div className="bg-white/80 backdrop-blur-sm overflow-x-auto shadow-xl rounded-lg">
                        <div className="p-6 min-w-[600px]">
                            <InventoryNavigation />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                                <h1 className="text-2xl font-bold text-[#54483A]">Low Stock Inventory</h1>
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
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E8E6E1] mx-auto">
                                    <thead>
                                        <tr className="bg-[#F5F5F5]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Warehouse
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Current Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Reorder Point
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Unit Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Last Restocked
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {inventory.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#F0EBE3] transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-[#54483A]">
                                                        {item.product.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{item.product.sku}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{item.warehouse.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{item.quantity}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{item.product.reorder_point}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">
                                                        ${Number(item.unit_price || 0).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">
                                                        {item.last_restocked_at ? new Date(item.last_restocked_at).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button
                                                        onClick={() => openAdjustmentModal(item)}
                                                        className="text-[#B85C38] hover:text-[#A04B2D] p-2 rounded-full hover:bg-[#F0EBE3] transition-colors duration-200"
                                                        title="Adjust Inventory"
                                                    >
                                                        <Wrench className="w-5 h-5" />
                                                    </button>
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
                                        Showing {inventory.from} to {inventory.to} of {inventory.total} items
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {inventory.links.map((link, index) => {
                                            if (link.label.includes("...")) {
                                                return <span key={index} className="px-3 py-2 text-[#8B7355]">{link.label}</span>;
                                            }

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

            {/* Adjustment Modal */}
            <Modal show={showAdjustmentModal} onClose={closeAdjustmentModal} maxWidth="md">
                <form onSubmit={handleAdjustment} className="p-6">
                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Adjust Inventory</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">
                                Product
                            </label>
                            <div className="text-sm text-[#54483A]">
                                {selectedItem?.product.name}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">
                                Warehouse
                            </label>
                            <div className="text-sm text-[#54483A]">
                                {selectedItem?.warehouse.name}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">
                                Current Quantity
                            </label>
                            <div className="text-sm text-[#54483A]">
                                {selectedItem?.quantity}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-[#8B7355] mb-1">
                                New Quantity
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value)}
                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                required
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-[#8B7355] mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                rows="3"
                                required
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeAdjustmentModal}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE] hover:from-[#857065] hover:to-[#C6AF9B] transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] transition-all duration-300 shadow-md hover:shadow-lg ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {processing ? 'Adjusting...' : 'Adjust Inventory'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
