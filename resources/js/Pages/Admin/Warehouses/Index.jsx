import Modal from '@/Components/Modal';
import PortalDropdown from '@/Components/PortalDropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

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

export default function Index({ warehouses = { data: [], links: [], from: 0, to: 0, total: 0 }, filters = { search: '', sort: 'created_at', direction: 'desc' }, users = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [sortColumn, setSortColumn] = useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');
    const [isDeleting, setIsDeleting] = useState(false);
    const [moveSourceWarehouse, setMoveSourceWarehouse] = useState(null);
    const [moveDestinationId, setMoveDestinationId] = useState('');
    const [isMoving, setIsMoving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [drawerWarehouse, setDrawerWarehouse] = useState(null);
    const [activeTab, setActiveTab] = useState('purchase_orders');
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    const [poLoading, setPoLoading] = useState(false);
    const [soLoading, setSoLoading] = useState(false);
    const [poStatus, setPoStatus] = useState('');
    const [soStatus, setSoStatus] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [warehouseProducts, setWarehouseProducts] = useState({});
    const [productsDropdownAnchor, setProductsDropdownAnchor] = useState(null);
    const [productsDropdownWarehouseId, setProductsDropdownWarehouseId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        location: '',
        capacity: '',
        description: '',
        owner_id: '',
        search: filters.search || '',
    });

    const handleInputChange = (field, value) => {
        clearErrors(field);
        setData(field, value);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowMoveModal(false);
        setSelectedWarehouse(null);
        setMoveSourceWarehouse(null);
        setMoveDestinationId('');
        reset();
        clearErrors();
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setMoveSourceWarehouse(null);
        setMoveDestinationId('');
    };

    const openAddModal = () => {
        reset({
            name: '',
            code: '',
            location: '',
            capacity: '',
            description: '',
            owner_id: '',
            search: data.search,
        });
        setSelectedWarehouse(null);
        clearErrors();
        setShowAddModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.warehouses.store'), {
            onSuccess: () => {
                closeModal();
                toast.success('Warehouse created successfully!', toastStyles);
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please check the form for errors', toastStyles);
                }
            },
        });
    };

    const handleEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setData({
            name: warehouse.name,
            code: warehouse.code,
            location: warehouse.location,
            capacity: warehouse.capacity,
            description: warehouse.description || '',
            owner_id: warehouse.owner_id,
            search: data.search,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.warehouses.update', selectedWarehouse.id), {
            onSuccess: () => {
                closeModal();
                toast.success('Warehouse updated successfully!', toastStyles);
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please check the form for errors', toastStyles);
                }
            },
        });
    };

    const handleDelete = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.warehouses.destroy', selectedWarehouse.id), {
            onSuccess: () => {
                closeModal();
                toast.success('Warehouse deleted successfully!', toastStyles);
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error, toastStyles);
                });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
            onSuccess: (page) => {
                if (page.props.flash && page.props.flash.error) {
                    toast.error(page.props.flash.error, toastStyles);
                }
            }
        });
    };

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
        router.get(route('admin.warehouses.index'), {
            sort: column,
            direction,
            search: data.search
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const debouncedSearch = debounce((value) => {
        router.get(route('admin.warehouses.index'), {
            search: value,
            sort: sortColumn,
            direction: sortDirection
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 300);

    const handleSearch = (e) => {
        setData('search', e.target.value);
        debouncedSearch(e.target.value);
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) return '↕';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const openMoveModal = (warehouse) => {
        setMoveSourceWarehouse(warehouse);
        setMoveDestinationId('');
        setShowMoveModal(true);
    };

    const handleMoveInventory = (e) => {
        e.preventDefault();
        setIsMoving(true);
        router.post(route('admin.warehouses.move-inventory'), {
            source_warehouse_id: moveSourceWarehouse.id,
            destination_warehouse_id: moveDestinationId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Inventory moved successfully!', toastStyles);
                closeMoveModal();
                router.reload({ only: ['warehouses'] });
            },
            onError: (errors) => {
                if (errors && errors.error) {
                    toast.error(Array.isArray(errors.error) ? errors.error[0] : errors.error, toastStyles);
                } else {
                    toast.error('Failed to move inventory.', toastStyles);
                }
            },
            onFinish: () => {
                setIsMoving(false);
            },
        });
    };

    const openDrawer = (warehouse) => {
        setDrawerWarehouse(warehouse);
        setActiveTab('purchase_orders');
        setShowDrawer(true);
    };

    const closeDrawer = () => {
        setShowDrawer(false);
        setDrawerWarehouse(null);
    };

    // Fetch purchase orders when drawer opens or poStatus changes
    useEffect(() => {
        if (showDrawer && drawerWarehouse && activeTab === 'purchase_orders') {
            setPoLoading(true);
            fetch(route('admin.warehouses.purchase-orders', drawerWarehouse.id) + (poStatus ? `?status=${poStatus}` : ''))
                .then(res => res.json())
                .then(data => setPurchaseOrders(data.orders))
                .finally(() => setPoLoading(false));
        }
    }, [showDrawer, drawerWarehouse, activeTab, poStatus]);

    // Fetch sales orders when drawer opens or soStatus changes
    useEffect(() => {
        if (showDrawer && drawerWarehouse && activeTab === 'sales_orders') {
            setSoLoading(true);
            fetch(route('admin.warehouses.sales-orders', drawerWarehouse.id) + (soStatus ? `?status=${soStatus}` : ''))
                .then(res => res.json())
                .then(data => setSalesOrders(data.orders))
                .finally(() => setSoLoading(false));
        }
    }, [showDrawer, drawerWarehouse, activeTab, soStatus]);

    // Add this function to handle tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPoStatus('');
        setSoStatus('');
        setActiveDropdown(null);
    };

    // Add this function to handle dropdown toggles
    const toggleDropdown = (id) => {
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.dropdown-container')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    // Add this function to handle warehouse products dropdown
    const openWarehouseProductsDropdown = (warehouseId, event) => {
        setProductsDropdownWarehouseId(warehouseId);
        setActiveDropdown(`warehouse-products-${warehouseId}`);
        setProductsDropdownAnchor(event.currentTarget.getBoundingClientRect());
        // Fetch products if not already loaded
        if (!warehouseProducts[warehouseId]) {
            fetch(route('admin.warehouses.products', warehouseId))
                .then(res => res.json())
                .then(data => {
                    setWarehouseProducts(prev => ({
                        ...prev,
                        [warehouseId]: data.products
                    }));
                });
        }
    };

    const closeWarehouseProductsDropdown = () => {
        setActiveDropdown(null);
        setProductsDropdownWarehouseId(null);
        setProductsDropdownAnchor(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Warehouses Management" />
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
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                                <h1 className="text-2xl font-bold text-[#54483A]">Warehouses Management</h1>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end">
                                    <div className="relative w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search warehouses..."
                                            value={data.search}
                                            onChange={handleSearch}
                                            className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={openAddModal}
                                        className="bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Warehouse
                                    </button>
                                    <button
                                        onClick={() => setShowMoveModal(true)}
                                        className="bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                                        title="Move Inventory"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l5-5m0 0l-5-5m5 5H3" />
                                        </svg>
                                        Move Inventory
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-[700px] divide-y divide-[#E8E6E1] mx-auto">
                                    <thead>
                                        <tr className="bg-[#F5F5F5]">
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider cursor-pointer hover:text-[#54483A] transition-colors duration-200"
                                                onClick={() => handleSort('name')}
                                            >
                                                Name {getSortIcon('name')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider cursor-pointer hover:text-[#54483A] transition-colors duration-200"
                                                onClick={() => handleSort('code')}
                                            >
                                                Code {getSortIcon('code')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider cursor-pointer hover:text-[#54483A] transition-colors duration-200"
                                                onClick={() => handleSort('location')}
                                            >
                                                Location {getSortIcon('location')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider"
                                            >
                                                Total Capacity
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider"
                                            >
                                                Total Products
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider"
                                            >
                                                Total Quantity
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider"
                                            >
                                                Available Capacity
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider cursor-pointer hover:text-[#54483A] transition-colors duration-200"
                                                onClick={() => handleSort('owner_id')}
                                            >
                                                Owner {getSortIcon('owner_id')}
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider cursor-pointer hover:text-[#54483A] transition-colors duration-200"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Created {getSortIcon('created_at')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {warehouses.data.map((warehouse) => (
                                            <tr
                                                key={warehouse.id}
                                                className="hover:bg-[#F0EBE3] transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        className="text-sm font-medium text-[#54483A] cursor-pointer hover:underline hover:text-[#B85C38]"
                                                        onClick={() => openDrawer(warehouse)}
                                                        title="View Details"
                                                    >
                                                        {warehouse.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{warehouse.code}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{warehouse.location}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{warehouse.capacity}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="relative dropdown-container">
                                                        <button
                                                            className="text-[#B85C38] hover:text-[#A04B2D] font-medium"
                                                            onClick={e => openWarehouseProductsDropdown(warehouse.id, e)}
                                                        >
                                                            {warehouse.total_products} products
                                                        </button>
                                                        <PortalDropdown
                                                            isOpen={activeDropdown === `warehouse-products-${warehouse.id}`}
                                                            anchorRect={productsDropdownAnchor}
                                                            onClose={closeWarehouseProductsDropdown}
                                                        >
                                                            {warehouseProducts[warehouse.id] ? (
                                                                warehouseProducts[warehouse.id].length > 0 ? (
                                                                    <div className="max-h-40 overflow-y-auto p-2">
                                                                        {warehouseProducts[warehouse.id].map(product => (
                                                                            <div key={product.id} className="text-sm text-[#8B7355] py-1 border-b border-[#E8E6E1] last:border-0">
                                                                                <div className="flex justify-between items-center gap-3">
                                                                                    <span>{product.name}</span>
                                                                                    <span className="text-xs text-[#B85C38]">{product.quantity} units</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-[#8B7355] py-1">No products found</div>
                                                                )
                                                            ) : (
                                                                <div className="text-sm text-[#8B7355] py-1">Loading...</div>
                                                            )}
                                                        </PortalDropdown>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{warehouse.total_quantity}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{warehouse.available_capacity}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">
                                                        {users.find(u => u.id === warehouse.owner_id)?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">
                                                        {new Date(warehouse.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleEdit(warehouse)}
                                                            className="text-[#8B7355] hover:text-[#54483A] transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(warehouse)}
                                                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add Warehouse Modal */}
                            <Modal show={showAddModal} onClose={closeModal} maxWidth="md">
                                <form onSubmit={handleSubmit} className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Add New Warehouse</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={e => handleInputChange('name', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="code" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Code
                                            </label>
                                            <input
                                                id="code"
                                                type="text"
                                                value={data.code}
                                                onChange={e => handleInputChange('code', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.code && (
                                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Location
                                            </label>
                                            <input
                                                id="location"
                                                type="text"
                                                value={data.location}
                                                onChange={e => handleInputChange('location', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.location && (
                                                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="capacity" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Capacity
                                            </label>
                                            <input
                                                id="capacity"
                                                type="number"
                                                step="0.01"
                                                value={data.capacity}
                                                onChange={e => handleInputChange('capacity', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.capacity && (
                                                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => handleInputChange('description', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                rows="3"
                                                autoComplete="off"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="owner_id" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Warehouse Owner
                                            </label>
                                            <select
                                                id="owner_id"
                                                value={data.owner_id}
                                                onChange={e => handleInputChange('owner_id', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                            >
                                                <option value="">Select an owner</option>
                                                {users.filter(user => {
                                                    // Hide users who already own a warehouse (except when editing and it's the current owner)
                                                    const alreadyHasWarehouse = warehouses.data.some(w => w.owner_id === user.id && user.id !== data.owner_id);
                                                    return !alreadyHasWarehouse;
                                                }).map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.owner_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.owner_id === 'The owner id field is required.' ? 'The owner is required.' : errors.owner_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE] hover:from-[#857065] hover:to-[#C6AF9B] transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] transition-all duration-300 shadow-md hover:shadow-lg ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {processing ? 'Creating...' : 'Create Warehouse'}
                                        </button>
                                    </div>
                                </form>
                            </Modal>

                            {/* Edit Warehouse Modal */}
                            <Modal show={showEditModal} onClose={closeModal} maxWidth="md">
                                <form onSubmit={handleUpdate} className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Edit Warehouse</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={e => handleInputChange('name', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="code" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Code
                                            </label>
                                            <input
                                                id="code"
                                                type="text"
                                                value={data.code}
                                                onChange={e => handleInputChange('code', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.code && (
                                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Location
                                            </label>
                                            <input
                                                id="location"
                                                type="text"
                                                value={data.location}
                                                onChange={e => handleInputChange('location', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.location && (
                                                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="capacity" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Capacity
                                            </label>
                                            <input
                                                id="capacity"
                                                type="number"
                                                step="0.01"
                                                value={data.capacity}
                                                onChange={e => handleInputChange('capacity', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.capacity && (
                                                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => handleInputChange('description', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                rows="3"
                                                autoComplete="off"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="owner_id" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Warehouse Owner
                                            </label>
                                            <select
                                                id="owner_id"
                                                value={data.owner_id}
                                                onChange={e => handleInputChange('owner_id', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                disabled={showEditModal}
                                            >
                                                <option value="">Select an owner</option>
                                                {users.filter(user => {
                                                    const alreadyHasWarehouse = warehouses.data.some(w => w.owner_id === user.id && user.id !== data.owner_id);
                                                    return !alreadyHasWarehouse;
                                                }).map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.owner_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.owner_id === 'The owner_id field is required.' ? 'The owner is required.' : errors.owner_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE] hover:from-[#857065] hover:to-[#C6AF9B] transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] transition-all duration-300 shadow-md hover:shadow-lg ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {processing ? 'Updating...' : 'Update Warehouse'}
                                        </button>
                                    </div>
                                </form>
                            </Modal>

                            {/* Delete Warehouse Modal */}
                            <Modal show={showDeleteModal} onClose={closeModal} maxWidth="md">
                                <div className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Delete Warehouse</h2>
                                    <p className="text-sm text-[#8B7355] mb-6">
                                        Are you sure you want to delete this warehouse? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isDeleting}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE] hover:from-[#857065] hover:to-[#C6AF9B] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={confirmDelete}
                                            disabled={isDeleting}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed ${isDeleting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete Warehouse'}
                                        </button>
                                    </div>
                                </div>
                            </Modal>

                            {/* Move Inventory Modal */}
                            <Modal show={showMoveModal} onClose={closeMoveModal} maxWidth="md">
                                <form onSubmit={handleMoveInventory} className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Move Inventory</h2>
                                    <div className="mb-4">
                                        <label htmlFor="source" className="block text-sm font-medium text-[#8B7355] mb-1">Source Warehouse</label>
                                        <select
                                            id="source"
                                            value={moveSourceWarehouse ? moveSourceWarehouse.id : ''}
                                            onChange={e => {
                                                const selected = warehouses.data.find(w => w.id == e.target.value);
                                                setMoveSourceWarehouse(selected || null);
                                            }}
                                            className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                            required
                                        >
                                            <option value="">Select a warehouse</option>
                                            {warehouses.data.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="destination" className="block text-sm font-medium text-[#8B7355] mb-1">Destination Warehouse</label>
                                        <select
                                            id="destination"
                                            value={moveDestinationId}
                                            onChange={e => setMoveDestinationId(e.target.value)}
                                            className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                            required
                                            disabled={!moveSourceWarehouse}
                                        >
                                            <option value="">Select a warehouse</option>
                                            {warehouses.data.filter(w => moveSourceWarehouse && w.id !== moveSourceWarehouse.id).map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeMoveModal}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE] hover:from-[#857065] hover:to-[#C6AF9B] transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isMoving || !moveSourceWarehouse || !moveDestinationId}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] transition-all duration-300 shadow-md hover:shadow-lg ${isMoving || !moveSourceWarehouse || !moveDestinationId ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {isMoving ? 'Moving...' : 'Move Inventory'}
                                        </button>
                                    </div>
                                </form>
                            </Modal>

                            {/* Pagination */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-[#8B7355]">
                                        Showing {warehouses.from} to {warehouses.to} of {warehouses.total} warehouses
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {warehouses.links.map((link, index) => {
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
            {/* Drawer Overlay */}
            <div
                className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${showDrawer ? '' : 'pointer-events-none'}`}
                style={{ visibility: showDrawer ? 'visible' : 'hidden' }}
            >
                {/* Blurred Background */}
                <div
                    className={`fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300 ${showDrawer ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeDrawer}
                />
                {/* Drawer Panel */}
                <div
                    className={`relative h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out`}
                    style={{
                        width: '75vw',
                        transform: showDrawer ? 'translateX(0)' : 'translateX(100%)',
                    }}
                >
                    <button
                        onClick={closeDrawer}
                        className="absolute top-4 right-4 text-[#B85C38] hover:text-[#A04B2D] text-2xl font-bold z-10"
                        title="Close"
                    >
                        &times;
                    </button>
                    <div className="p-8 pt-12 h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-[#54483A] mb-6">Warehouse: {drawerWarehouse?.name}</h2>
                        <div className="flex gap-6 border-b border-[#E8E6E1] mb-6">
                            <button
                                className={`pb-2 px-2 text-lg font-medium transition-colors duration-200 ${activeTab === 'purchase_orders' ? 'border-b-4 border-[#B85C38] text-[#B85C38]' : 'text-[#8B7355] hover:text-[#B85C38]'}`}
                                onClick={() => handleTabChange('purchase_orders')}
                            >
                                Purchase Orders
                            </button>
                            <button
                                className={`pb-2 px-2 text-lg font-medium transition-colors duration-200 ${activeTab === 'sales_orders' ? 'border-b-4 border-[#B85C38] text-[#B85C38]' : 'text-[#8B7355] hover:text-[#B85C38]'}`}
                                onClick={() => handleTabChange('sales_orders')}
                            >
                                Sales Orders
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'purchase_orders' && (
                                <div className="py-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <label className="text-sm text-[#8B7355]">Status:</label>
                                        <select
                                            value={poStatus}
                                            onChange={e => setPoStatus(e.target.value)}
                                            className="rounded border-[#E8E6E1] focus:border-[#B85C38]"
                                        >
                                            <option value="">All</option>
                                            <option value="pending">Pending</option>
                                            <option value="ordered">Ordered</option>
                                            <option value="in_transit">In Transit</option>
                                            <option value="partially_received">Partially Received</option>
                                            <option value="received">Received</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    {poLoading ? (
                                        <div className="text-[#8B7355]">Loading...</div>
                                    ) : (
                                        <>
                                            <table className="min-w-full text-sm border-separate border-spacing-y-1">
                                                <thead>
                                                    <tr className="bg-[#F5F5F5] text-[#54483A]">
                                                        <th className="px-3 py-2 text-left">PO #</th>
                                                        <th className="px-3 py-2 text-left">Supplier</th>
                                                        <th className="px-3 py-2 text-left">Created By</th>
                                                        <th className="px-3 py-2 text-left">Date</th>
                                                        <th className="px-3 py-2 text-left">Status</th>
                                                        <th className="px-3 py-2 text-left">Products</th>
                                                        <th className="px-3 py-2 text-left">Quantity</th>
                                                        <th className="px-3 py-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {purchaseOrders.length === 0 ? (
                                                        <tr><td colSpan={8} className="text-center text-[#8B7355] py-4">No purchase orders found.</td></tr>
                                                    ) : purchaseOrders.data.map(po => (
                                                        <tr key={po.id} className="bg-white border-b hover:bg-[#F5F5F5] transition">
                                                            <td className="px-3 py-2 font-medium">{po.po_number}</td>
                                                            <td className="px-3 py-2">{po.supplier?.name || '-'}</td>
                                                            <td className="px-3 py-2">{po.creator?.name || '-'}</td>
                                                            <td className="px-3 py-2">{new Date(po.created_at).toLocaleDateString()}</td>
                                                            <td className="px-3 py-2 capitalize">{po.status.replace('_', ' ')}</td>
                                                            <td className="px-3 py-2">
                                                                <div className="relative dropdown-container">
                                                                    <button
                                                                        className="text-[#B85C38] hover:text-[#A04B2D] font-medium"
                                                                        onClick={() => toggleDropdown(`po-products-${po.id}`)}
                                                                    >
                                                                        {po.product_count} products
                                                                    </button>
                                                                    <div className={`absolute left-0 top-full mt-2 min-w-[20rem] bg-white rounded-lg shadow-lg border border-[#E8E6E1] ${activeDropdown === `po-products-${po.id}` ? 'block' : 'hidden'} z-50`}>
                                                                        <div className="max-h-40 overflow-y-auto p-2">
                                                                            {po.items.map(item => (
                                                                                <div key={item.id} className="text-sm text-[#8B7355] py-1 border-b border-[#E8E6E1] last:border-0">
                                                                                    {item.product?.name || 'Product'}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className="relative dropdown-container">
                                                                    <button
                                                                        className="text-[#B85C38] hover:text-[#A04B2D] font-medium"
                                                                        onClick={() => toggleDropdown(`po-quantity-${po.id}`)}
                                                                    >
                                                                        {po.total_quantity} units
                                                                    </button>
                                                                    <div className={`absolute left-0 top-full mt-2 min-w-[20rem] bg-white rounded-lg shadow-lg border border-[#E8E6E1] ${activeDropdown === `po-quantity-${po.id}` ? 'block' : 'hidden'} z-50`}>
                                                                        <div className="max-h-40 overflow-y-auto p-2">
                                                                            {po.items.map(item => (
                                                                                <div key={item.id} className="text-sm text-[#8B7355] py-1 border-b border-[#E8E6E1] last:border-0">
                                                                                    {item.product?.name || 'Product'}: {item.quantity} units
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-semibold text-[#B85C38]">
                                                                {po.grand_total ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(po.grand_total) : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {purchaseOrders.links && (
                                                <div className="mt-4 flex justify-end">
                                                    <div className="flex items-center gap-2">
                                                        {purchaseOrders.links.map((link, index) => {
                                                            return (
                                                                <button
                                                                    key={index}
                                                                    className={`px-3 py-1 rounded ${link.active
                                                                            ? 'bg-[#B85C38] text-white'
                                                                            : 'bg-white text-[#8B7355] hover:bg-[#F5F5F5]'
                                                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    onClick={() => link.url && fetch(link.url).then(res => res.json()).then(data => setPurchaseOrders(data.orders))}
                                                                    disabled={!link.url}
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {activeTab === 'sales_orders' && (
                                <div className="py-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <label className="text-sm text-[#8B7355]">Status:</label>
                                        <select
                                            value={soStatus}
                                            onChange={e => setSoStatus(e.target.value)}
                                            className="rounded border-[#E8E6E1] focus:border-[#B85C38]"
                                        >
                                            <option value="">All</option>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    {soLoading ? (
                                        <div className="text-[#8B7355]">Loading...</div>
                                    ) : (
                                        <>
                                            <table className="min-w-full text-sm border-separate border-spacing-y-1">
                                                <thead>
                                                    <tr className="bg-[#F5F5F5] text-[#54483A]">
                                                        <th className="px-3 py-2 text-left">SO #</th>
                                                        <th className="px-3 py-2 text-left">Created By</th>
                                                        <th className="px-3 py-2 text-left">Date</th>
                                                        <th className="px-3 py-2 text-left">Status</th>
                                                        <th className="px-3 py-2 text-left">Products</th>
                                                        <th className="px-3 py-2 text-left">Quantity</th>
                                                        <th className="px-3 py-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {salesOrders.length === 0 ? (
                                                        <tr><td colSpan={7} className="text-center text-[#8B7355] py-4">No sales orders found.</td></tr>
                                                    ) : salesOrders.data.map(so => (
                                                        <tr key={so.id} className="bg-white border-b hover:bg-[#F5F5F5] transition">
                                                            <td className="px-3 py-2 font-medium">{so.order_number}</td>
                                                            <td className="px-3 py-2">{so.created_by?.name || so.createdBy?.name || '-'}</td>
                                                            <td className="px-3 py-2">{new Date(so.created_at).toLocaleDateString()}</td>
                                                            <td className="px-3 py-2 capitalize">{so.status.replace('_', ' ')}</td>
                                                            <td className="px-3 py-2">
                                                                <div className="relative dropdown-container">
                                                                    <button
                                                                        className="text-[#B85C38] hover:text-[#A04B2D] font-medium"
                                                                        onClick={() => toggleDropdown(`so-products-${so.id}`)}
                                                                    >
                                                                        {so.product_count} products
                                                                    </button>
                                                                    <div className={`absolute left-0 top-full mt-2 min-w-[20rem] bg-white rounded-lg shadow-lg border border-[#E8E6E1] ${activeDropdown === `so-products-${so.id}` ? 'block' : 'hidden'} z-50`}>
                                                                        <div className="max-h-40 overflow-y-auto p-2">
                                                                            {so.items.map(item => (
                                                                                <div key={item.id} className="text-sm text-[#8B7355] py-1 border-b border-[#E8E6E1] last:border-0">
                                                                                    {item.product?.name || 'Product'}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className="relative dropdown-container">
                                                                    <button
                                                                        className="text-[#B85C38] hover:text-[#A04B2D] font-medium"
                                                                        onClick={() => toggleDropdown(`so-quantity-${so.id}`)}
                                                                    >
                                                                        {so.total_quantity} units
                                                                    </button>
                                                                    <div className={`absolute left-0 top-full mt-2 min-w-[20rem] bg-white rounded-lg shadow-lg border border-[#E8E6E1] ${activeDropdown === `so-quantity-${so.id}` ? 'block' : 'hidden'} z-50`}>
                                                                        <div className="max-h-40 overflow-y-auto p-2">
                                                                            {so.items.map(item => (
                                                                                <div key={item.id} className="text-sm text-[#8B7355] py-1 border-b border-[#E8E6E1] last:border-0">
                                                                                    {item.product?.name || 'Product'}: {item.quantity} units
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-semibold text-[#B85C38]">
                                                                {so.grand_total ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(so.grand_total) : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {salesOrders.links && (
                                                <div className="mt-4 flex justify-end">
                                                    <div className="flex items-center gap-2">
                                                        {salesOrders.links.map((link, index) => {
                                                            return (
                                                                <button
                                                                    key={index}
                                                                    className={`px-3 py-1 rounded ${link.active
                                                                            ? 'bg-[#B85C38] text-white'
                                                                            : 'bg-white text-[#8B7355] hover:bg-[#F5F5F5]'
                                                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    onClick={() => link.url && fetch(link.url).then(res => res.json()).then(data => setSalesOrders(data.orders))}
                                                                    disabled={!link.url}
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
