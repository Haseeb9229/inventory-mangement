import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Eye } from 'lucide-react';

export default function PurchaseReturnsIndex({ auth, returns = { data: [], links: [], from: 0, to: 0, total: 0 }, filters = {}, suppliers = [], warehouses = [], products = [], purchaseOrders = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [supplier, setSupplier] = useState(filters.supplier_id || '');
    const [warehouse, setWarehouse] = useState(filters.warehouse_id || '');
    const [product, setProduct] = useState(filters.product_id || '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewReturn, setViewReturn] = useState(null);
    const [poItems, setPoItems] = useState([]);
    const [selectedPO, setSelectedPO] = useState('');

    // Add form state
    const getInitialFormState = () => ({
        purchase_order_id: '',
        purchase_order_item_id: '',
        product_id: '',
        warehouse_id: '',
        quantity: '',
        reason: '',
        notes: '',
    });
    const addForm = useForm(getInitialFormState());

    // Handlers for filters
    const handleSearch = (e) => {
        setSearch(e.target.value);
        router.get(route('admin.purchase-returns.index'), {
            ...filters,
            search: e.target.value,
            supplier_id: supplier,
            warehouse_id: warehouse,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleSupplierChange = (e) => {
        setSupplier(e.target.value);
        router.get(route('admin.purchase-returns.index'), {
            ...filters,
            search,
            supplier_id: e.target.value,
            warehouse_id: warehouse,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleWarehouseChange = (e) => {
        setWarehouse(e.target.value);
        router.get(route('admin.purchase-returns.index'), {
            ...filters,
            search,
            supplier_id: supplier,
            warehouse_id: e.target.value,
            product_id: product,
        }, { preserveState: true, preserveScroll: true });
    };
    const handleProductChange = (e) => {
        const prodId = e.target.value;
        addForm.setData('product_id', prodId);
        addForm.clearErrors('product_id');
        // Set purchase_order_item_id
        const item = poItems.find(i => String(i.product_id) === String(prodId));
        addForm.setData('purchase_order_item_id', item ? item.id : '');
    };

    // Add/View handlers
    const openAddModal = () => {
        addForm.reset();
        addForm.setData(getInitialFormState());
        addForm.clearErrors();
        setPoItems([]);
        setSelectedPO('');
        setShowAddModal(true);
    };
    const closeAddModal = () => {
        setShowAddModal(false);
        addForm.reset();
    };
    const openViewModal = (ret) => {
        setViewReturn(ret);
        setShowViewModal(true);
    };
    const closeViewModal = () => {
        setViewReturn(null);
        setShowViewModal(false);
    };

    // Add submit
    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('admin.purchase-returns.store'), {
            onSuccess: () => {
                toast.success('Purchase return created!');
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

    // Handle PO change
    const handlePOChange = async (e) => {
        const poId = e.target.value;
        setSelectedPO(poId);
        addForm.setData('purchase_order_id', poId);
        addForm.setData('purchase_order_item_id', '');
        addForm.setData('product_id', '');
        setPoItems([]);
        addForm.clearErrors('purchase_order_id');
        if (poId) {
            // Find the selected PO and set its warehouse
            const po = purchaseOrders.find(po => String(po.id) === String(poId));
            if (po) {
                addForm.setData('warehouse_id', po.warehouse_id);
            }
            try {
                const res = await fetch(route('admin.purchase-returns.po-items', poId));
                const data = await res.json();
                setPoItems(data.items);
            } catch (err) {
                setPoItems([]);
            }
        } else {
            addForm.setData('warehouse_id', '');
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Purchase Returns" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-8">
                    <div className="bg-white/80 backdrop-blur-sm overflow-x-auto shadow-xl rounded-lg">
                        <div className="p-6 min-w-[900px]">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                                <h1 className="text-2xl font-bold text-[#54483A]">Purchase Returns</h1>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B] hover:from-[#A04B2D] hover:to-[#D1614A] transition-all duration-300 shadow-md hover:shadow-lg" onClick={openAddModal}>
                                    <Plus className="w-5 h-5" /> Create New Purchase Return
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end mb-6">
                                <input
                                    type="text"
                                    placeholder="Search PO number, product..."
                                    value={search}
                                    onChange={handleSearch}
                                    className="w-full md:w-auto rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50 bg-white/50 backdrop-blur-sm"
                                />
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Warehouse</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Returned By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {returns.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center text-[#8B7355] py-4">No purchase returns found.</td>
                                            </tr>
                                        ) : (
                                            returns.data.map(ret => (
                                                <tr key={ret.id} className="hover:bg-[#F0EBE3] transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#54483A]">{ret.purchase_order?.po_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{ret.purchase_order?.supplier?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{ret.product?.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{ret.warehouse?.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{ret.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{ret.returned_by ? (ret.returned_by.name || '-') : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{ret.created_at ? new Date(ret.created_at).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                        <button title="View" onClick={() => openViewModal(ret)} className="text-[#8B7355] hover:text-[#54483A] transition-colors duration-200">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
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
                                        Showing {returns.from} to {returns.to} of {returns.total} returns
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {returns.links?.map((link, index) => {
                                            if (link.label.includes("...")) {
                                                return <span key={index} className="px-3 py-2 text-[#8B7355]">{link.label}</span>;
                                            }
                                            return (
                                                <button
                                                    key={index}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} ${link.active ? 'bg-gradient-to-r from-[#B85C38] to-[#E2725B] text-white shadow-md' : link.url ? 'bg-white hover:bg-gradient-to-r hover:from-[#D5BEA4] hover:to-[#E8D5C4] text-[#8B7355] hover:text-white border border-[#E8E6E1]' : 'bg-[#F5F5F5] text-[#8B7355] border border-[#E8E6E1]'}`}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
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
            {/* Add Modal */}
            <Modal show={showAddModal} onClose={closeAddModal} maxWidth="2xl">
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-[#8B7355]">Create Purchase Return</h2>
                    <form className="space-y-4" onSubmit={handleAddSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Purchase Order</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.purchase_order_id} onChange={handlePOChange}>
                                    <option value="">Select PO</option>
                                    {purchaseOrders.map(po => (
                                        <option key={po.id} value={po.id}>{po.po_number}</option>
                                    ))}
                                </select>
                                {addForm.errors.purchase_order_id && <div className="text-red-600 text-xs mt-1">{addForm.errors.purchase_order_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Product</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.product_id} onChange={handleProductChange} disabled={!selectedPO}>
                                    <option value="">Select Product</option>
                                    {poItems.map(item => (
                                        <option key={item.product_id} value={item.product_id}>{item.product?.name}</option>
                                    ))}
                                </select>
                                {addForm.errors.product_id && <div className="text-red-600 text-xs mt-1">{addForm.errors.product_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Warehouse</label>
                                <select className="w-full rounded-lg border-[#E8E6E1]" value={addForm.data.warehouse_id} onChange={e => { addForm.setData('warehouse_id', e.target.value); addForm.clearErrors('warehouse_id'); }} disabled={!!selectedPO}>
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                {addForm.errors.warehouse_id && <div className="text-red-600 text-xs mt-1">{addForm.errors.warehouse_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Quantity</label>
                                <input type="number" min={1} className="w-full rounded-lg border-[#E8E6E1]" placeholder="Quantity" value={addForm.data.quantity} onChange={e => { addForm.setData('quantity', e.target.value); addForm.clearErrors('quantity'); }} />
                                {addForm.errors.quantity && <div className="text-red-600 text-xs mt-1">{addForm.errors.quantity}</div>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">Reason</label>
                            <textarea className="w-full rounded-lg border-[#E8E6E1]" rows={2} placeholder="Reason" value={addForm.data.reason} onChange={e => { addForm.setData('reason', e.target.value); addForm.clearErrors('reason'); }} />
                            {addForm.errors.reason && <div className="text-red-600 text-xs mt-1">{addForm.errors.reason}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-1">Notes</label>
                            <textarea className="w-full rounded-lg border-[#E8E6E1]" rows={2} placeholder="Notes" value={addForm.data.notes} onChange={e => { addForm.setData('notes', e.target.value); addForm.clearErrors('notes'); }} />
                            {addForm.errors.notes && <div className="text-red-600 text-xs mt-1">{addForm.errors.notes}</div>}
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
            {/* View Modal */}
            <Modal show={showViewModal} onClose={closeViewModal} maxWidth="2xl">
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6 text-[#8B7355] border-b pb-2">Purchase Return Details</h2>
                    {viewReturn ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-[#8B7355]">PO Number:</span> {viewReturn.purchase_order?.po_number}</div>
                                <div><span className="font-semibold text-[#8B7355]">Supplier:</span> {viewReturn.purchase_order?.supplier?.name || '-'}</div>
                                <div><span className="font-semibold text-[#8B7355]">Product:</span> {viewReturn.product?.name}</div>
                                <div><span className="font-semibold text-[#8B7355]">Warehouse:</span> {viewReturn.warehouse?.name}</div>
                                <div><span className="font-semibold text-[#8B7355]">Returned By:</span> {viewReturn.returned_by ? (viewReturn.returned_by.name || '-') : '-'}</div>
                                <div><span className="font-semibold text-[#8B7355]">Date:</span> {viewReturn.created_at ? new Date(viewReturn.created_at).toLocaleDateString() : '-'}</div>
                                <div><span className="font-semibold text-[#8B7355]">Quantity:</span> {viewReturn.quantity}</div>
                            </div>
                            <div className="border-t pt-4 text-sm"><span className="font-semibold text-[#8B7355]">Reason:</span> {viewReturn.reason || <span className="italic text-gray-400">None</span>}</div>
                            <div className="border-t pt-4 text-sm"><span className="font-semibold text-[#8B7355]">Notes:</span> {viewReturn.notes || <span className="italic text-gray-400">None</span>}</div>
                        </div>
                    ) : <div className="text-[#8B7355]">No details available.</div>}
                </div>
            </Modal>
            <Toaster position="top-right" toastOptions={{ duration: 3000, className: 'font-medium' }} />
        </AuthenticatedLayout>
    );
}
