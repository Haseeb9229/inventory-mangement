import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Users,
    Warehouse,
    Package,
    ShoppingCart,
    Truck,
    AlertTriangle,
    AlertCircle,
    Clock,
    Tag,
    DollarSign,
    CheckCircle,
    BarChart2,
    TrendingUp,
    TrendingDown,
    UserCheck,
    Boxes
} from 'lucide-react';

export default function Dashboard({ auth, statsData, userRole }) {
    const stats = [
        {
            title: 'Total Users',
            value: statsData.users_count,
            icon: Users,
            color: 'text-blue-500'
        },
        {
            title: 'Warehouses',
            value: statsData.warehouses_count,
            icon: Warehouse,
            color: 'text-green-500'
        },
        {
            title: 'Total Products',
            value: statsData.products_count,
            icon: Package,
            color: 'text-purple-500'
        },
        {
            title: 'Purchase Orders',
            value: statsData.purchase_orders_count,
            icon: ShoppingCart,
            color: 'text-orange-500'
        },
        {
            title: 'Sales Orders',
            value: statsData.sales_orders_count,
            icon: Truck,
            color: 'text-red-500'
        },
        {
            title: 'Suppliers',
            value: statsData.suppliers_count,
            icon: Users,
            color: 'text-indigo-500'
        },
        {
            title: 'Low Stock Items',
            value: statsData.low_stock_items_count,
            icon: AlertTriangle,
            color: 'text-yellow-500'
        },
        {
            title: 'Out of Stock Items',
            value: statsData.out_of_stock_items_count,
            icon: AlertCircle,
            color: 'text-red-500'
        },
        {
            title: 'Pending Purchase Orders',
            value: statsData.pending_purchase_orders,
            icon: Clock,
            color: 'text-orange-500'
        },
        {
            title: 'Pending Sales Orders',
            value: statsData.pending_sales_orders,
            icon: Clock,
            color: 'text-orange-500'
        },
        {
            title: 'Inventory Value',
            value: statsData.inventory_value,
            icon: DollarSign,
            color: 'text-green-500'
        },
        {
            title: 'Products In Stock',
            value: statsData.total_products_in_stock,
            icon: CheckCircle,
            color: 'text-green-500'
        },
        {
            title: 'Total Quantity in Stock',
            value: statsData.total_quantity_in_stock,
            icon: Boxes,
            color: 'text-yellow-600'
        },
        {
            title: 'Total Sales Value',
            value: statsData.total_sales_value,
            icon: TrendingUp,
            color: 'text-green-600'
        },
        {
            title: 'Total Purchase Value',
            value: statsData.total_purchase_value,
            icon: TrendingDown,
            color: 'text-orange-600'
        },
        {
            title: 'Delivered Orders',
            value: statsData.delivered_orders_count,
            icon: BarChart2,
            color: 'text-purple-600'
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
