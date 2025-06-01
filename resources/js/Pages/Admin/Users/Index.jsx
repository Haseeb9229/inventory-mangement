import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import Modal from '@/Components/Modal';
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

export default function Index({ users = { data: [], links: [], from: 0, to: 0, total: 0 }, roles = [], filters = { search: '', sort: 'created_at', direction: 'desc' } }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [sortColumn, setSortColumn] = useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors, setError } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
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
        setSelectedUser(null);
        reset();
        clearErrors();
    };

    const openAddModal = () => {
        // Reset form data before opening add modal
        reset({
            name: '',
            email: '',
            password: '',
            role: '',
            search: data.search,
        });
        setShowAddModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                closeModal();
                toast.success('User created successfully!', toastStyles);
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please check the form for errors', toastStyles);
                }
            },
        });
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.roles[0]?.name || '',
            password: '', // Clear password field
            search: data.search, // Preserve search value
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                closeModal();
                toast.success('User updated successfully!', toastStyles);
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please check the form for errors', toastStyles);
                }
            },
        });
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.users.destroy', selectedUser.id), {
            onSuccess: () => {
                closeModal();
                toast.success('User deleted successfully!', toastStyles);
            },
            onError: (errors) => {
                // If the error is a string (from backend 409), show it as a toast
                if (typeof errors === 'string') {
                    toast.error(errors, toastStyles);
                } else if (errors && typeof errors.error === 'string') {
                    toast.error(errors.error, toastStyles);
                } else {
                    Object.values(errors).forEach(error => {
                        toast.error(error, toastStyles);
                    });
                }
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const formatRoleName = (roleName) => {
        const nameMap = {
            'order_placer': 'Order Placer',
            'warehouse_owner': 'Warehouse Owner',
            'admin': 'Admin'
        };
        return nameMap[roleName] || roleName;
    };

    const getRoleGradient = (roleName) => {
        const gradientMap = {
            'admin': 'from-[#B85C38] to-[#E2725B]',
            'warehouse_owner': 'from-[#4A6741] to-[#6B8E4E]',
            'order_placer': 'from-[#7B6079] to-[#9B8E9B]'
        };
        return gradientMap[roleName] || 'from-[#D5BEA4] to-[#E8D5C4]';
    };

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
        router.get(route('admin.users.index'), {
            sort: column,
            direction,
            search: data.search
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const debouncedSearch = debounce((value) => {
        router.get(route('admin.users.index'), {
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

    return (
        <AuthenticatedLayout>
            <Head title="Users Management" />
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
                                <h1 className="text-2xl font-bold text-[#54483A]">Users Management</h1>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end">
                                    <div className="relative w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search users..."
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
                                        Add User
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E8E6E1] mx-auto">
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
                                                onClick={() => handleSort('email')}
                                            >
                                                Email {getSortIcon('email')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider cursor-pointer hover:text-[#54483A] transition-colors duration-200"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Joined {getSortIcon('created_at')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#E8E6E1]">
                                        {users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-[#F0EBE3] transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-[#54483A]">{user.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${getRoleGradient(role.name)} text-white shadow-sm`}
                                                            >
                                                                {formatRoleName(role.name)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#8B7355]">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="text-[#8B7355] hover:text-[#54483A] transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
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

                            {/* Add User Modal */}
                            <Modal show={showAddModal} onClose={closeModal} maxWidth="md">
                                <form onSubmit={handleSubmit} className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Add New User</h2>

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
                                            <label htmlFor="email" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => handleInputChange('email', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={e => handleInputChange('password', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="new-password"
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Role
                                            </label>
                                            <select
                                                id="role"
                                                value={data.role}
                                                onChange={e => handleInputChange('role', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            >
                                                <option value="">Select a role</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.name}>
                                                        {formatRoleName(role.name)}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.role && (
                                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
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
                                            {processing ? 'Creating...' : 'Create User'}
                                        </button>
                                    </div>
                                </form>
                            </Modal>

                            {/* Edit User Modal */}
                            <Modal show={showEditModal} onClose={closeModal} maxWidth="md">
                                <form onSubmit={handleUpdate} className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Edit User</h2>

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
                                            <label htmlFor="email" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => handleInputChange('email', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={e => handleInputChange('password', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="new-password"
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium text-[#8B7355] mb-1">
                                                Role
                                            </label>
                                            <select
                                                id="role"
                                                value={data.role}
                                                onChange={e => handleInputChange('role', e.target.value)}
                                                className="w-full rounded-lg border-[#E8E6E1] focus:border-[#D5BEA4] focus:ring focus:ring-[#D5BEA4] focus:ring-opacity-50"
                                                autoComplete="off"
                                            >
                                                <option value="">Select a role</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.name}>
                                                        {formatRoleName(role.name)}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.role && (
                                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
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
                                            {processing ? 'Updating...' : 'Update User'}
                                        </button>
                                    </div>
                                </form>
                            </Modal>

                            {/* Delete User Modal */}
                            <Modal show={showDeleteModal} onClose={closeModal} maxWidth="md">
                                <div className="p-6">
                                    <h2 className="text-lg font-medium text-[#54483A] mb-6">Delete User</h2>
                                    <p className="text-sm text-[#8B7355] mb-6">
                                        Are you sure you want to delete this user? This action cannot be undone.
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
                                            {isDeleting ? 'Deleting...' : 'Delete User'}
                                        </button>
                                    </div>
                                </div>
                            </Modal>

                            {/* Pagination */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-[#8B7355]">
                                        Showing {users.from} to {users.to} of {users.total} users
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {users.links.map((link, index) => {
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
