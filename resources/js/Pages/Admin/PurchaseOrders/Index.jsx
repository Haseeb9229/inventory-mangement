import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Plus, Eye, Edit, Trash2, CheckCircle, Ban } from 'lucide-react';
import Modal from '@/Components/Modal';
import toast, { Toaster } from 'react-hot-toast';

const statusStyles = {
    draft: {
        gradient: 'from-gray-100 to-gray-300 text-gray-800',
        icon: <CheckCircle className="w-4 h-4 mr-1 text-gray-400" />, label: 'Draft',
    },
    pending: {
        gradient: 'from-amber-100 to-amber-200 text-amber-900',
        icon: <CheckCircle className="w-4 h-4 mr-1 text-amber-700" />, label: 'Pending',
    },
    ordered: {
        gradient: 'from-blue-100 to-blue-200 text-blue-900',
        icon: <CheckCircle className="w-4 h-4 mr-1 text-blue-700" />, label: 'Ordered',
    },
    received: {
        gradient: 'from-emerald-100 to-emerald-300 text-emerald-900',
        icon: <CheckCircle className="w-4 h-4 mr-1 text-emerald-700" />, label: 'Received',
    },
};

export default function PurchaseOrdersIndex({ auth, orders = { data: [], links: [], from: 0, to: 0, total: 0 }, filters = {}, suppliers = [], warehouses = [], products = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [supplier, setSupplier] = useState(filters.supplier_id || '');
    const [warehouse, setWarehouse] = useState(filters.warehouse_id || '');
    const [product, setProduct] = useState(filters.product_id || '');
    const [showPartialPaidModal, setShowPartialPaidModal] = useState(false);
    const [partialPaidOrder, setPartialPaidOrder] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [partialReceiveItems, setPartialReceiveItems] = useState([]);
    const [partialReceiveLoading, setPartialReceiveLoading] = useState(false);
    const [partialReceiveError, setPartialReceiveError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewOrder, setViewOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    const initialItem = { product_id: '', quantity: 1, unit_price: '', tax_rate: '', notes: '' };

    // Add form state
    const getInitialFormState = () => ({
        po_number: '',
        supplier_id: '',
        warehouse_id: '',
        status: 'draft',
        expected_delivery_date: '',
        notes: '',
        shipping_amount: '',
        items: [{ ...initialItem }],
    });
    const addForm = useForm(getInitialFormState());
    // Edit form state
    const editForm = useForm({
        po_number: '',
        supplier_id: '',
        warehouse_id: '',
        status: 'draft',
        expected_delivery_date: '',
        notes: '',
        shipping_amount: '',
        items: [{ ...initialItem }],
    });

    // Handlers for filters
    const handleSearch = (e) => {
        setSearch(e.target.value);
        router.get(route('admin.purchase-orders.index'), {
            ...filters,
            search: e.target.value,
            status,
            supplier_id: supplier,
            warehouse_id: warehouse,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        router.get(route('admin.purchase-orders.index'), {
            ...filters,
            search,
            status: e.target.value,
            supplier_id: supplier,
            warehouse_id: warehouse,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleSupplierChange = (e) => {
        setSupplier(e.target.value);
        router.get(route('admin.purchase-orders.index'), {
            ...filters,
            search,
            status,
            supplier_id: e.target.value,
            warehouse_id: warehouse,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleWarehouseChange = (e) => {
        setWarehouse(e.target.value);
        router.get(route('admin.purchase-orders.index'), {
            ...filters,
            search,
            status,
            supplier_id: supplier,
            warehouse_id: e.target.value,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleProductChange = (e) => {
        setProduct(e.target.value);
        router.get(route('admin.purchase-orders.index'), {
            ...filters,
            search,
            status,
            supplier_id: supplier,
            warehouse_id: warehouse,
            product_id: e.target.value,
        }, { preserveState: true, preserveScroll: true });
    };

    const openPartialPaidModal = (order) => {
        setPartialPaidOrder(order);
        setPartialReceiveItems(
            (order.items || []).map(item => ({
                id: item.id,
                name: item.product?.name || '',
                ordered: item.quantity,
                received: item.received_quantity || 0,
                toReceive: 0,
            }))
        );
        setShowPartialPaidModal(true);
    };

    const closePartialPaidModal = () => {
        setShowPartialPaidModal(false);
        setPartialPaidOrder(null);
    };

    // Add/Edit/View handlers
    const openAddModal = () => {
        addForm.reset();
        addForm.setData(getInitialFormState());
        addForm.clearErrors();
        setShowAddModal(true);
    };
    const closeAddModal = () => {
        setShowAddModal(false);
        addForm.reset();
    };
    const openEditModal = (order) => {
        setEditOrder(order);
        editForm.setData({
            po_number: order.po_number,
            supplier_id: order.supplier_id,
            warehouse_id: order.warehouse_id,
            status: order.status,
            expected_delivery_date: order.expected_delivery_date ? order.expected_delivery_date.split('T')[0] : '',
            notes: order.notes || '',
            shipping_amount: order.shipping_amount ?? '',
            items: (order.items || []).map(item => ({
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price !== undefined && item.unit_price !== null && item.unit_price !== '' ? item.unit_price : (item.product?.price ?? ''),
                tax_rate: item.tax_rate,
                notes: item.notes || '',
            })),
        });
        editForm.clearErrors();
        setShowEditModal(true);
    };
    const closeEditModal = () => {
        setEditOrder(null);
        setShowEditModal(false);
    };
    const openViewModal = (order) => {
        setViewOrder(order);
        setShowViewModal(true);
    };
    const closeViewModal = () => {
        setViewOrder(null);
        setShowViewModal(false);
    };

    // Update action handlers to show loading
    const setLoading = (orderId, action, value) => {
        setActionLoading(prev => ({ ...prev, [`${orderId}_${action}`]: value }));
    };
    const handleMarkAsOrdered = (order) => {
        setLoading(order.id, 'ordered', true);
        router.post(route('admin.purchase-orders.mark-as-ordered', order.id), {}, {
            onSuccess: () => toast.success('Order marked as ordered!'),
            onError: () => toast.error('Failed to mark as ordered.'),
            onFinish: () => setLoading(order.id, 'ordered', false),
        });
    };
    const handleMarkAsReceived = (order) => {
        setLoading(order.id, 'received', true);
        router.post(route('admin.purchase-orders.mark-as-received', order.id), {}, {
            onSuccess: () => toast.success('Order marked as received!'),
            onError: () => toast.error('Failed to mark as received.'),
            onFinish: () => setLoading(order.id, 'received', false),
        });
    };
    const handleMarkAsCancelled = (order) => {
        setLoading(order.id, 'cancel', true);
        router.post(route('admin.purchase-orders.mark-as-cancelled', order.id), {}, {
            onSuccess: () => toast.success('Order marked as cancelled!'),
            onError: () => toast.error('Failed to mark as cancelled.'),
            onFinish: () => setLoading(order.id, 'cancel', false),
        });
    };
    const handleDelete = (order) => {
        setDeletingOrder(order);
        setShowDeleteModal(true);
    };
    const confirmDelete = () => {
        if (!deletingOrder) return;
        setLoading(deletingOrder.id, 'delete', true);
        router.delete(route('admin.purchase-orders.destroy', deletingOrder.id), {
            onSuccess: () => {
                toast.success('Order deleted!');
                setShowDeleteModal(false);
                setDeletingOrder(null);
            },
            onError: () => toast.error('Failed to delete order.'),
            onFinish: () => setLoading(deletingOrder.id, 'delete', false),
        });
    };

    const handlePartialReceiveChange = (idx, value) => {
        setPartialReceiveItems(items => items.map((item, i) => i === idx ? { ...item, toReceive: value } : item));
    };

    const submitPartialReceive = (e) => {
        e.preventDefault();
        setPartialReceiveLoading(true);
        setPartialReceiveError('');
        const items = partialReceiveItems
            .filter(item => Number(item.toReceive) > 0)
            .map(item => ({ id: item.id, quantity: Number(item.toReceive) }));
        if (items.length === 0) {
            setPartialReceiveError('Please enter at least one received quantity.');
            setPartialReceiveLoading(false);
            return;
        }
        handleMarkAsPartiallyReceived(items);
        setPartialReceiveLoading(false);
    };

    // Add item row
    const addItemRow = (form) => {
        form.setData('items', [...form.data.items, { ...initialItem }]);
    };
    // Remove item row
    const removeItemRow = (form, idx) => {
        if (form.data.items.length === 1) return;
        form.setData('items', form.data.items.filter((_, i) => i !== idx));
    };

    // Add submit
    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('admin.purchase-orders.store'), {
            onSuccess: () => {
                toast.success('Purchase order created!');
                closeAddModal();
                addForm.reset();
            },
            onError: (errors) => {
                if (errors) {
                    const firstError = Object.values(errors)[0];
                    if (firstError) toast.error('Fill all the required fields');
                }
            },
        });
    };
    // Edit submit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editOrder) return;
        editForm.put(route('admin.purchase-orders.update', editOrder.id), {
            onSuccess: () => {
                toast.success('Purchase order updated!');
                closeEditModal();
            },
            onError: (errors) => {
                if (errors) {
                    const firstError = Object.values(errors)[0];
                    if (firstError) toast.error('Fill all the required fields');
                }
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Purchase Orders" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-8">
                    <div className="bg-white/80 backdrop-blur-sm overflow-x-auto shadow-xl rounded-lg">
                        <div className="p-6 min-w-[900px]">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                                <h1 className="text-2xl font-bold text-[#54483A]">Purchase Orders</h1>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] transition-all duration-300 shadow-md hover:shadow-lg" onClick={openAddModal}>
                                    <Plus className="w-5 h-5" /> Add Purchase Order
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end mb-6">
                                <input
                                    type="text"
                                    placeholder="Search PO number, supplier..."
                                    value={search}
                                    onChange={handleSearch}
                                    className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm"
                                />
                                <select value={status} onChange={handleStatusChange} className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm">
                                    <option value="">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="partially_received">Partially Received</option>
                                    <option value="received">Received</option>
                                    <option value="cancel">Cancelled</option>
                                </select>
                                <select value={supplier} onChange={handleSupplierChange} className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm">
                                    <option value="">All Suppliers</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <select value={warehouse} onChange={handleWarehouseChange} className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm">
                                    <option value="">All Warehouses</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                <select value={product} onChange={handleProductChange} className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm">
                                    <option value="">All Products</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E8E6E1]">
                                    <thead>
                                        <tr className="bg-[#F5F5F5]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">PO Number</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Supplier</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Warehouse</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Created By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Created At</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {orders.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center text-[#8B7355] py-4">No purchase orders found.</td>
                                            </tr>
                                        ) : (
                                            orders.data.map(order => (
                                                <tr key={order.id} className="hover:bg-[#F0EBE3] transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#54483A]">{order.po_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{order.supplier?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{order.warehouse?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full shadow-sm font-semibold text-xs bg-gradient-to-r ${statusStyles[order.status]?.gradient || 'from-gray-100 to-gray-300 text-gray-800'} border border-white/40 backdrop-blur-sm bg-opacity-80 transition-all duration-200`}>
                                                            {statusStyles[order.status]?.icon}
                                                            {statusStyles[order.status]?.label || order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">${Number(order.grand_total || 0).toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{order.creator?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <button title="View" onClick={() => openViewModal(order)} className="text-[#8B7355] hover:text-[#54483A] transition-colors duration-200">
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            {(order.status === 'draft' || order.status === 'pending') && <>
                                                                <button title="Edit" onClick={() => openEditModal(order)} className="text-[#8B7355] hover:text-[#54483A] transition-colors duration-200">
                                                                    <Edit className="w-5 h-5" />
                                                                </button>
                                                                <button title="Delete" onClick={() => handleDelete(order)} className="text-red-500 hover:text-red-700 transition-colors duration-200" disabled={actionLoading[`${order.id}_delete`]}>
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                                <button title="Mark as Ordered" onClick={() => handleMarkAsOrdered(order)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200" disabled={actionLoading[`${order.id}_ordered`]}>
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                            </>}
                                                            {order.status === 'ordered' && <>
                                                                <button title="Mark as Received" onClick={() => handleMarkAsReceived(order)} className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200" disabled={actionLoading[`${order.id}_received`]}>
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button title="Mark as Partially Received" onClick={() => openPartialPaidModal(order)} className="text-amber-600 hover:text-amber-800 transition-colors duration-200">
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button title="Mark as Cancel" onClick={() => handleMarkAsCancelled(order)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200" disabled={actionLoading[`${order.id}_cancel`]}>
                                                                    <Ban className="w-5 h-5" />
                                                                </button>
                                                            </>}
                                                            {order.status === 'partially_received' && <>
                                                                <button title="Mark as Received" onClick={() => handleMarkAsReceived(order)} className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200" disabled={actionLoading[`${order.id}_received`]}>
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                            </>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-[#8B7355]">
                                        Showing {orders.from} to {orders.to} of {orders.total} orders
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {orders.links?.map((link, index) => {
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
            {/* Partial Paid Modal */}
            <Modal show={showPartialPaidModal} onClose={closePartialPaidModal} maxWidth="2xl">
                <form onSubmit={submitPartialReceive} className="p-6">
                    <h2 className="text-xl font-bold mb-4 text-[#8B7355]">Mark as Partially Received</h2>
                    <div className="space-y-4">
                        {partialReceiveItems.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="font-medium text-[#54483A]">{item.name || 'Product'}</div>
                                    <div className="text-xs text-[#8B7355]">Ordered: {item.ordered}, Already Received: {item.received}</div>
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={item.ordered - item.received}
                                    value={item.toReceive}
                                    onChange={e => handlePartialReceiveChange(idx, Math.max(0, Math.min(item.ordered - item.received, Number(e.target.value))))}
                                    className="w-24 rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                    placeholder="Qty"
                                />
                            </div>
                        ))}
                    </div>
                    {partialReceiveError && <div className="text-red-600 mt-2 text-sm">{partialReceiveError}</div>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closePartialPaidModal} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE]">Cancel</button>
                        <button type="submit" disabled={partialReceiveLoading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B]">
                            {partialReceiveLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 text-[#B85C38]">Delete Purchase Order</h2>
                    <p>Are you sure you want to delete PO #{deletingOrder?.po_number}?</p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE]">Cancel</button>
                        <button onClick={confirmDelete} disabled={actionLoading[`${deletingOrder?.id}_delete`]} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B]">
                            {actionLoading[`${deletingOrder?.id}_delete`] ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Add Modal */}
            <Modal show={showAddModal} onClose={closeAddModal} maxWidth="2xl">
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-[#8B7355]">Add New Purchase Order</h2>
                    <form className="space-y-4" onSubmit={handleAddSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">PO Number</label>
                                <input className="w-full rounded-lg border-[#E8E6E1]" placeholder="PO Number" value={addForm.data.po_number} onChange={e => { addForm.setData('po_number', e.target.value); addForm.clearErrors('po_number'); }} />
                                {addForm.errors.po_number && <div className="text-red-600 text-xs mt-1">{addForm.errors.po_number}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Supplier</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.supplier_id} onChange={e => { addForm.setData('supplier_id', e.target.value); addForm.clearErrors('supplier_id'); }}>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {addForm.errors.supplier_id && <div className="text-red-600 text-xs mt-1">{addForm.errors.supplier_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Warehouse</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.warehouse_id} onChange={e => { addForm.setData('warehouse_id', e.target.value); addForm.clearErrors('warehouse_id'); }}>
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                {addForm.errors.warehouse_id && <div className="text-red-600 text-xs mt-1">{addForm.errors.warehouse_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Status</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.status} onChange={e => { addForm.setData('status', e.target.value); addForm.clearErrors('status'); }}>
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="partially_received">Partially Received</option>
                                    <option value="received">Received</option>
                                    <option value="cancel">Cancelled</option>
                                </select>
                                {addForm.errors.status && <div className="text-red-600 text-xs mt-1">{addForm.errors.status}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Expected Delivery Date</label>
                                <input type="date" className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.expected_delivery_date} onChange={e => { addForm.setData('expected_delivery_date', e.target.value); addForm.clearErrors('expected_delivery_date'); }} />
                                {addForm.errors.expected_delivery_date && <div className="text-red-600 text-xs mt-1">{addForm.errors.expected_delivery_date}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Shipping Price</label>
                                <input type="number" min="0" className="w-full rounded-lg border-[#E8E6E1]" placeholder="Shipping Price" value={addForm.data.shipping_amount} onChange={e => { addForm.setData('shipping_amount', e.target.value); addForm.clearErrors('shipping_amount'); }} />
                                {addForm.errors.shipping_amount && <div className="text-red-600 text-xs mt-1">{addForm.errors.shipping_amount}</div>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">Notes</label>
                            <textarea className="w-full rounded-lg border-[#E8E6E1]" rows={2} placeholder="Notes" value={addForm.data.notes} onChange={e => { addForm.setData('notes', e.target.value); addForm.clearErrors('notes'); }} />
                            {addForm.errors.notes && <div className="text-red-600 text-xs mt-1">{addForm.errors.notes}</div>}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#8B7355] mb-2">Items</h3>
                            <div className="overflow-x-auto min-w-full">
                                {addForm.data.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2 items-end">
                                        <select className="rounded-lg border-[#E8E6E1]" value={item.product_id} onChange={e => {
                                            const selectedProduct = products.find(p => p.id == e.target.value);
                                            const price = selectedProduct ? (selectedProduct.price ?? '') : '';
                                            addForm.setData('items', addForm.data.items.map((it, i) => i === idx ? { ...it, product_id: e.target.value, unit_price: price } : it));
                                            addForm.clearErrors(`items.${idx}.product_id`);
                                        }}>
                                            <option value="">Product</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" min={1} className="w-20 rounded-lg border-[#E8E6E1]" placeholder="Qty" value={item.quantity} onChange={e => { addForm.setData('items', addForm.data.items.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it)); addForm.clearErrors(`items.${idx}.quantity`); }} />
                                        <input type="number" min={0} className="w-24 rounded-lg border-[#E8E6E1]" placeholder="Unit Price" value={item.unit_price} onChange={e => { addForm.setData('items', addForm.data.items.map((it, i) => i === idx ? { ...it, unit_price: e.target.value } : it)); addForm.clearErrors(`items.${idx}.unit_price`); }} />
                                        <input type="number" min={0} className="w-20 rounded-lg border-[#E8E6E1]" placeholder="Tax %" value={item.tax_rate} onChange={e => { addForm.setData('items', addForm.data.items.map((it, i) => i === idx ? { ...it, tax_rate: e.target.value } : it)); addForm.clearErrors(`items.${idx}.tax_rate`); }} />
                                        <input className="w-32 rounded-lg border-[#E8E6E1]" placeholder="Notes" value={item.notes} onChange={e => { addForm.setData('items', addForm.data.items.map((it, i) => i === idx ? { ...it, notes: e.target.value } : it)); addForm.clearErrors(`items.${idx}.notes`); }} />
                                        <button type="button" onClick={() => removeItemRow(addForm, idx)} className="text-red-500 px-2">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addItemRow(addForm)} className="text-[#8B7355] font-semibold mt-2">+ Add Item</button>
                            {addForm.errors['items'] && <div className="text-red-600 text-xs mt-1">{addForm.errors['items']}</div>}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={closeAddModal} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE]">Cancel</button>
                            <button type="submit" disabled={addForm.processing} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B]">
                                {addForm.processing ? 'Submitting...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="2xl">
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-[#8B7355]">Edit Purchase Order</h2>
                    <form className="space-y-4" onSubmit={handleEditSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">PO Number</label>
                                <input className="w-full rounded-lg border-[#E8E6E1]" placeholder="PO Number" value={editForm.data.po_number} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Supplier</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={editForm.data.supplier_id} onChange={e => { editForm.setData('supplier_id', e.target.value); editForm.clearErrors('supplier_id'); }}>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {editForm.errors.supplier_id && <div className="text-red-600 text-xs mt-1">{editForm.errors.supplier_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Warehouse</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={editForm.data.warehouse_id} onChange={e => { editForm.setData('warehouse_id', e.target.value); editForm.clearErrors('warehouse_id'); }}>
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                {editForm.errors.warehouse_id && <div className="text-red-600 text-xs mt-1">{editForm.errors.warehouse_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Status</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={editForm.data.status} onChange={e => { editForm.setData('status', e.target.value); editForm.clearErrors('status'); }}>
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="partially_received">Partially Received</option>
                                    <option value="received">Received</option>
                                    <option value="cancel">Cancelled</option>
                                </select>
                                {editForm.errors.status && <div className="text-red-600 text-xs mt-1">{editForm.errors.status}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Expected Delivery Date</label>
                                <input type="date" className="w-full rounded-lg border-[#E8E6E1]" value={editForm.data.expected_delivery_date} onChange={e => { editForm.setData('expected_delivery_date', e.target.value); editForm.clearErrors('expected_delivery_date'); }} />
                                {editForm.errors.expected_delivery_date && <div className="text-red-600 text-xs mt-1">{editForm.errors.expected_delivery_date}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Shipping Price</label>
                                <input type="number" min="0" className="w-full rounded-lg border-[#E8E6E1]" placeholder="Shipping Price" value={editForm.data.shipping_amount} onChange={e => { editForm.setData('shipping_amount', e.target.value); editForm.clearErrors('shipping_amount'); }} />
                                {editForm.errors.shipping_amount && <div className="text-red-600 text-xs mt-1">{editForm.errors.shipping_amount}</div>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">Notes</label>
                            <textarea className="w-full rounded-lg border-[#E8E6E1]" rows={2} placeholder="Notes" value={editForm.data.notes} onChange={e => { editForm.setData('notes', e.target.value); editForm.clearErrors('notes'); }} />
                            {editForm.errors.notes && <div className="text-red-600 text-xs mt-1">{editForm.errors.notes}</div>}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#8B7355] mb-2">Items</h3>
                            <div className="overflow-x-auto min-w-full">
                                {editForm.data.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2 items-end">
                                        <select className="rounded-lg border-[#E8E6E1]" value={item.product_id} onChange={e => {
                                            const selectedProduct = products.find(p => p.id == e.target.value);
                                            const price = selectedProduct ? (selectedProduct.price ?? '') : '';
                                            editForm.setData('items', editForm.data.items.map((it, i) => i === idx ? { ...it, product_id: e.target.value, unit_price: price } : it));
                                            editForm.clearErrors(`items.${idx}.product_id`);
                                        }}>
                                            <option value="">Product</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" min={1} className="w-20 rounded-lg border-[#E8E6E1]" placeholder="Qty" value={item.quantity} onChange={e => { editForm.setData('items', editForm.data.items.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it)); editForm.clearErrors(`items.${idx}.quantity`); }} />
                                        <input type="number" min={0} className="w-24 rounded-lg border-[#E8E6E1]" placeholder="Unit Price" value={item.unit_price} onChange={e => { editForm.setData('items', editForm.data.items.map((it, i) => i === idx ? { ...it, unit_price: e.target.value } : it)); editForm.clearErrors(`items.${idx}.unit_price`); }} />
                                        <input type="number" min={0} className="w-20 rounded-lg border-[#E8E6E1]" placeholder="Tax %" value={item.tax_rate} onChange={e => { editForm.setData('items', editForm.data.items.map((it, i) => i === idx ? { ...it, tax_rate: e.target.value } : it)); editForm.clearErrors(`items.${idx}.tax_rate`); }} />
                                        <input className="w-32 rounded-lg border-[#E8E6E1]" placeholder="Notes" value={item.notes} onChange={e => { editForm.setData('items', editForm.data.items.map((it, i) => i === idx ? { ...it, notes: e.target.value } : it)); editForm.clearErrors(`items.${idx}.notes`); }} />
                                        <button type="button" onClick={() => removeItemRow(editForm, idx)} className="text-red-500 px-2">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addItemRow(editForm)} className="text-[#8B7355] font-semibold mt-2">+ Add Item</button>
                            {editForm.errors['items'] && <div className="text-red-600 text-xs mt-1">{editForm.errors['items']}</div>}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE]">Cancel</button>
                            <button type="submit" disabled={editForm.processing} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B]">
                                {editForm.processing ? 'Submitting...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* View Modal */}
            <Modal show={showViewModal} onClose={closeViewModal} maxWidth="2xl">
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6 text-[#8B7355] border-b pb-2">Purchase Order Details</h2>
                    {viewOrder ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-[#8B7355]">PO Number:</span> {viewOrder.po_number}</div>
                                <div><span className="font-semibold text-[#8B7355]">Status:</span> {viewOrder.status}</div>
                                <div><span className="font-semibold text-[#8B7355]">Supplier:</span> {viewOrder.supplier?.name}</div>
                                <div><span className="font-semibold text-[#8B7355]">Warehouse:</span> {viewOrder.warehouse?.name}</div>
                                <div><span className="font-semibold text-[#8B7355]">Created By:</span> {viewOrder.creator?.name}</div>
                                <div><span className="font-semibold text-[#8B7355]">Created At:</span> {viewOrder.created_at ? new Date(viewOrder.created_at).toLocaleDateString() : '-'}</div>
                                <div><span className="font-semibold text-[#8B7355]">Expected Delivery:</span> {viewOrder.expected_delivery_date ? new Date(viewOrder.expected_delivery_date).toLocaleDateString() : '-'}</div>
                            </div>
                            <div className="border-t pt-4 text-sm"><span className="font-semibold text-[#8B7355]">Notes:</span> {viewOrder.notes || <span className="italic text-gray-400">None</span>}</div>
                            <div>
                                <h3 className="font-semibold text-[#8B7355] mb-2 text-lg border-b pb-1">Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-[#E8E6E1] text-sm">
                                        <thead>
                                            <tr className="bg-[#F5F5F5]">
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Product</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Qty</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Received</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Unit Price</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Subtotal</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Tax</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Total</th>
                                                <th className="px-4 py-2 text-xs font-medium text-[#8B7355] uppercase">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                            {viewOrder.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-2 font-medium text-[#54483A]">{item.product?.name}</td>
                                                    <td className="px-4 py-2">{item.quantity}</td>
                                                    <td className="px-4 py-2">{item.received_quantity || 0}</td>
                                                    <td className="px-4 py-2">${Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="px-4 py-2">${Number(item.subtotal).toFixed(2)}</td>
                                                    <td className="px-4 py-2">${Number(item.tax_amount || 0).toFixed(2)}</td>
                                                    <td className="px-4 py-2">${(Number(item.subtotal) + Number(item.tax_amount || 0)).toFixed(2)}</td>
                                                    <td className="px-4 py-2">{item.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-end gap-6 mt-4 border-t pt-4 text-base">
                                <div><span className="font-semibold text-[#8B7355]">Total:</span> ${Number(viewOrder.total_amount || 0).toFixed(2)}</div>
                                <div><span className="font-semibold text-[#8B7355]">Tax:</span> ${Number(viewOrder.tax_amount || 0).toFixed(2)}</div>
                                <div><span className="font-semibold text-[#8B7355]">Shipping:</span> ${Number(viewOrder.shipping_amount || 0).toFixed(2)}</div>
                                <div><span className="font-semibold text-[#8B7355]">Grand Total:</span> ${Number(viewOrder.grand_total || 0).toFixed(2)}</div>
                            </div>
                        </div>
                    ) : <div className="text-[#8B7355]">No details available.</div>}
                </div>
            </Modal>
            <Toaster position="top-right" toastOptions={{ duration: 3000, className: 'font-medium' }} />
        </AuthenticatedLayout>
    );
}
