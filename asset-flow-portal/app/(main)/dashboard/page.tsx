'use client';

import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/auth/authSlice';
import { useLogoutMutation } from '../../../store/auth/authApiSlice';
import { useRouter } from 'next/navigation';
import StatCard from '../../../components/StatCard';
import { Package, CheckCircle, Wrench, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

// Static mock data
const assetStatusData = [
  { name: 'Active', value: 245, color: '#10b981' },
  { name: 'Under Maintenance', value: 38, color: '#f59e0b' },
  { name: 'Retired', value: 17, color: '#ef4444' },
];

const assetCategoryData = [
  { category: 'Laptops', count: 85 },
  { category: 'Monitors', count: 120 },
  { category: 'Phones', count: 65 },
  { category: 'Servers', count: 15 },
  { category: 'Printers', count: 15 },
];

const acquisitionTrendData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 25 },
  { month: 'May', count: 22 },
  { month: 'Jun', count: 30 },
];

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
      router.push('/login');
    }
  };

  const totalAssets = assetStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name || 'User'}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Assets"
          value={totalAssets}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Active"
          value={assetStatusData[0].value}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Under Maintenance"
          value={assetStatusData[1].value}
          icon={Wrench}
          trend={{ value: 3, isPositive: false }}
          color="yellow"
        />
        <StatCard
          title="Retired"
          value={assetStatusData[2].value}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Status Distribution - Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Asset Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by Category - Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Assets by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetCategoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Acquisition Trend - Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Asset Acquisition Trend (Last 6 Months)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={acquisitionTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}