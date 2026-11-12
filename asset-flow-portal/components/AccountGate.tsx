'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetProfileQuery } from '@/store/auth/authApiSlice';
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useGetProfileQuery(undefined);
  const router=useRouter();
  useEffect(()=>{if(data?.user?.mustChangePassword)router.replace('/change-password')},[data,router]);
  if(isLoading || data?.user?.mustChangePassword) return <p className="p-8">Loading account…</p>;
  if(isError) return <p className="p-8">Unable to load your account. Please sign in again.</p>;
  return <>{children}</>;
}
