import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeft, TrendingUp, MapPin, ShoppingBag, CreditCard } from 'lucide-react';
import { useTransactionStats } from '../hooks/useTransactions';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
    const { data: statsData, isLoading } = useTransactionStats({});
    const stats = statsData?.data || {};

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-surface-400">Loading analytics...</div>
            </div>
        );
    }

    // Prepare chart data
    const statusData = stats.statusBreakdown?.map((s, i) => ({
        name: s.status,
        value: s.count,
        fill: COLORS[i % COLORS.length]
    })) || [];

    const regionData = stats.regionBreakdown?.map((r, i) => ({
        name: r.region,
        revenue: r.revenue,
        count: r.count,
        fill: COLORS[i % COLORS.length]
    })) || [];

    const categoryData = stats.categoryBreakdown?.map((c, i) => ({
        name: c.category,
        revenue: c.revenue,
        count: c.count,
        fill: COLORS[i % COLORS.length]
    })) || [];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(value);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-surface-900/80 border-b border-surface-700/50">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-surface-400 hover:text-surface-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Transactions</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                        <div className="h-6 w-px bg-surface-700 hidden sm:block" />
                        <h1 className="text-lg sm:text-xl font-bold text-surface-100">Analytics</h1>
                    </div>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <StatCard
                        icon={TrendingUp}
                        label="Total Transactions"
                        value={stats.totalTransactions?.toLocaleString() || '0'}
                        color="primary"
                    />
                    <StatCard
                        icon={CreditCard}
                        label="Total Revenue"
                        value={formatCurrency(stats.totalRevenue || 0)}
                        color="emerald"
                    />
                    <StatCard
                        icon={ShoppingBag}
                        label="Categories"
                        value={categoryData.length}
                        color="amber"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Order Status Pie Chart */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-surface-100 mb-4">Orders by Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={false}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => value.toLocaleString()}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9'
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue by Region Pie Chart */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-surface-100 mb-4">Revenue by Region</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={regionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="revenue"
                                    label={({ name }) => name}
                                    labelLine={false}
                                >
                                    {regionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9'
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Categories Bar Chart */}
                    <div className="glass-card p-4 sm:p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-surface-100 mb-4">Top Categories by Revenue</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={categoryData} layout="vertical">
                                <XAxis type="number" tickFormatter={formatCurrency} stroke="#64748b" />
                                <YAxis type="category" dataKey="name" width={120} stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9'
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colorClasses = {
        primary: 'border-primary-500/30 text-primary-400',
        emerald: 'border-emerald-500/30 text-emerald-400',
        amber: 'border-amber-500/30 text-amber-400',
    };

    return (
        <div className={`glass-card p-5 ${colorClasses[color]}`}>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-surface-700/50">
                    <Icon className={`w-6 h-6 ${colorClasses[color].split(' ').pop()}`} />
                </div>
                <div>
                    <div className="text-sm text-surface-400">{label}</div>
                    <div className="text-2xl font-bold text-surface-100">{value}</div>
                </div>
            </div>
        </div>
    );
}
