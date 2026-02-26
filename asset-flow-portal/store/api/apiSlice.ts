import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logOut } from '../auth/authSlice';
import Cookies from 'js-cookie';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  prepareHeaders: (headers) => {
    const token = Cookies.get('accessToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Clear the redux state
    api.dispatch(logOut());
    
    // Clear cookies explicitly so NextJS middleware drops the authentication layout mapping
    Cookies.remove('accessToken');
    Cookies.remove('user_role');
    
    // Hard navigate if we're operating within the browser layer
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Site', 'Building', 'Floor', 'Category', 'Division', 'Department', 'Unit', 'Asset'],
  endpoints: (builder) => ({}),
});
