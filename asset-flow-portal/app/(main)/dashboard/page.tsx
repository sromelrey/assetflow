'use client';

import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/auth/authSlice';
import { useLogoutMutation } from '../../../store/auth/authApiSlice';
import { useRouter } from 'next/navigation';

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
        // Middleware will likely redirect anyway if cookies are gone
        router.push('/login');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded shadow dark:bg-gray-800 dark:text-white">
        <h2 className="text-xl mb-2">Welcome, {user?.name || 'User'}!</h2>
        <p className="mb-4">Email: {user?.email}</p>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}