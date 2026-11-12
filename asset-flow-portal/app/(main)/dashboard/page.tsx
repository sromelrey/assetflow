'use client';

import React, { useMemo, useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/auth/authSlice';
import StatCard from '../../../components/StatCard';
import { Package, CheckCircle, Wrench, XCircle, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { useGetAssetMetricsQuery } from '@/store/api/assetsApi';
import { useGetSitesQuery } from '@/store/api/locationsApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_COLORS: Record<string, string> = {
  Active:           '#10b981', // Emerald
  Deployed:         '#3b82f6', // Blue
  Decommissioned:   '#ef4444', // Red
  'For Repair':     '#f59e0b', // Amber
  'For Deployment': '#6366f1', // Indigo
  'In Storage':     '#64748b', // Slate
};

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  
  const { data: sites } = useGetSitesQuery();
  const { data: metrics, isLoading, isError } = useGetAssetMetricsQuery(
    selectedSite !== 'all' ? selectedSite : undefined
  );

  // Map API distributions into Recharts-friendly arrays with colors
  const assetStatusData = useMemo(() => {
    if (!metrics) return [];
    return metrics.statusDistribution.map(item => ({
      name: item.status,
      value: item.count,
      color: STATUS_COLORS[item.status] || '#9ca3af' // Default gray
    })).sort((a, b) => b.value - a.value); // largest first
  }, [metrics]);

  const assetCategoryData = useMemo(() => {
    if (!metrics) return [];
    return metrics.categoryDistribution.map(item => ({
      category: item.category,
      count: item.count
    })).sort((a, b) => b.count - a.count).slice(0, 10); // top 10 categories
  }, [metrics]);

  const acquisitionTrendData = useMemo(() => {
    if (!metrics) return [];
    return metrics.acquisitionTrend;
  }, [metrics]);

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-lg shadow-sm"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-[380px] bg-white dark:bg-gray-800 rounded-lg shadow-sm"></div>
          <div className="h-[380px] bg-white dark:bg-gray-800 rounded-lg shadow-sm"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center text-red-500 max-w-md bg-red-50 dark:bg-red-900/10 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load dashboard data</h2>
          <p className="text-sm">Please check your connection and ensure the API server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name || 'User'}!</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 pl-2">Filter by Site:</span>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites?.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Assets"
          value={metrics.totalAssets}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Active / Deployed"
          value={metrics.active}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Under Maintenance"
          value={metrics.underMaintenance}
          icon={Wrench}
          color="yellow"
        />
        <StatCard
          title="Retired"
          value={metrics.retired}
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
          {assetStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        {/* Assets by Category - Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Assets by Category
          </h2>
          {assetCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetCategoryData} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Acquisition Trend - Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Asset Acquisition Trend (Last 6 Months)
        </h2>
        {acquisitionTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={acquisitionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );
}