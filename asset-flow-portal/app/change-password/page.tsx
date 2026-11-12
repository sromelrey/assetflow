'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useChangePasswordMutation, useLogoutMutation } from '@/store/auth/authApiSlice';
import { useAppDispatch } from '@/store/hooks';
import { logOut } from '@/store/auth/authSlice';
import { apiSlice } from '@/store/api/apiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function ChangePassword() {
  const [currentPassword,setCurrent] = useState(''); const [newPassword,setNew] = useState(''); const [confirmation,setConfirmation] = useState(''); const [message,setMessage] = useState('');
  const [change,{isLoading}] = useChangePasswordMutation(); const [logout] = useLogoutMutation(); const router = useRouter(); const dispatch=useAppDispatch();
  return <main className="max-w-md mx-auto p-8 space-y-4"><h1 className="text-xl font-semibold">Set a new password</h1><form className="space-y-4" onSubmit={async e=>{e.preventDefault();if(newPassword!==confirmation){setMessage('New passwords do not match');return;}try{await change({currentPassword,newPassword}).unwrap();Cookies.remove('accessToken');Cookies.remove('refreshToken');Cookies.remove('user_role');dispatch(logOut());dispatch(apiSlice.util.resetApiState());router.replace('/login');}catch{setMessage('Password change failed. Check your current password and try again.')}}}>
    <label className="block">Current temporary password<Input type="password" autoComplete="current-password" required maxLength={256} value={currentPassword} onChange={e=>setCurrent(e.target.value)}/></label>
    <label className="block">New password (at least 12 characters)<Input type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={newPassword} onChange={e=>setNew(e.target.value)}/></label>
    <label className="block">Confirm new password<Input type="password" autoComplete="new-password" required value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label>
    <p role="alert">{message}</p><Button disabled={isLoading}>Change password</Button><Button type="button" variant="outline" onClick={async()=>{await logout({});router.replace('/login')}}>Sign out</Button>
  </form></main>;
}
