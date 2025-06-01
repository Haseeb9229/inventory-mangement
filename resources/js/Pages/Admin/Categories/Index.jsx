import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import Modal from '@/Components/Modal';
import toast, { Toaster } from 'react-hot-toast';
import { Pencil } from 'lucide-react';

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

export default function CategoriesIndex({ categories = { data: [], links: [], from: 0, to: 0, total: 0 }, filters = { search: '' } }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        search: filters.search || '',
    });

    const closeModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCategory(null);
        reset();
        clearErrors();
    };

    const openAddModal = () => {
        reset({
            name: '',
            description: '',
            search: filters.search || '',
        });
        clearErrors();
        setShowAddModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                closeModal();
                toast.success('Category created successfully!', toastStyles);
            },
            onError: (errors) => {
                toast.error('Please check the form for errors', toastStyles);
            },
        });
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            search: data.search,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('categories.update', selectedCategory.id), {
            onSuccess: () => {
                closeModal();
                toast.success('Category updated successfully!', toastStyles);
            },
            onError: (errors) => {
                toast.error('Please check the form for errors', toastStyles);
            },
        });
    };

    const debouncedSearch = debounce((value) => {
        router.get(route('categories.index'), {
            search: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 300);

    const handleSearch = (e) => {
        setData('search', e.target.value);
        debouncedSearch(e.target.value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Categories" />
            <Toaster position="top-right" toastOptions={{ duration: 3000, className: 'font-medium' }} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-8">
                    <div className="bg-white/80 backdrop-blur-sm overflow-x-auto shadow-xl rounded-lg">
                        <div className="p-6 min-w-[700px]">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                                <h1 className="text-2xl font-bold text-[#54483A]">Categories</h1>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end">
                                    <div className="relative w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
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
                                        Add Category
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E8E6E1] mx-auto">
                                    <thead>
                                        <tr className="bg-[#F5F5F5]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {categories.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center text-[#8B7355] py-4">No categories found.</td>
                                            </tr>
                                        ) : (
                                            categories.data.map(category => (
                                                <tr key={category.id} className="hover:bg-[#F0EBE3] transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#54483A]">{category.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#8B7355]">{category.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <button
                                                            onClick={() => handleEdit(category)}
                                                            className="text-[#8B7355] hover:text-[#54483A] p-2 rounded-full hover:bg-[#F0EBE3] transition-colors duration-200"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-5 h-5" />
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
                                        Showing {categories.from} to {categories.to} of {categories.total} categories
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {categories.links?.map((link, index) => {
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
            <Modal show={showAddModal} onClose={closeModal} maxWidth="xl">
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-[#8B7355]">Add Category</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Name</label>
                                <input className="w-full rounded-lg border-[#E8E6E1]" value={data.name} onChange={e => { setData('name', e.target.value); clearErrors('name'); }}  />
                                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Description</label>
                                <textarea className="w-full rounded-lg border-[#E8E6E1]" value={data.description} onChange={e => { setData('description', e.target.value); clearErrors('description'); }} />
                                {errors.description && <div className="text-red-600 text-xs mt-1">{errors.description}</div>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE]">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B]">
                                {processing ? 'Submitting...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={closeModal} maxWidth="xl">
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-[#8B7355]">Edit Category</h2>
                    <form className="space-y-4" onSubmit={handleUpdate}>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Name</label>
                                <input className="w-full rounded-lg border-[#E8E6E1]" value={data.name} onChange={e => { setData('name', e.target.value); clearErrors('name'); }}  />
                                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#8B7355] mb-1">Description</label>
                                <textarea className="w-full rounded-lg border-[#E8E6E1]" value={data.description} onChange={e => { setData('description', e.target.value); clearErrors('description'); }} />
                                {errors.description && <div className="text-red-600 text-xs mt-1">{errors.description}</div>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#967E76] to-[#D7C0AE]">Cancel</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B85C38] to-[#E2725B]">
                                {processing ? 'Submitting...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
