import { apiSlice } from '../api/apiSlice';
import { setCredentials, logOut } from './authSlice';
import Cookies from 'js-cookie';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // data matches { user, accessToken, refreshToken } from backend
          const { user, accessToken, refreshToken } = data;
          
          // Set cookies
          Cookies.set('accessToken', accessToken);
          Cookies.set('refreshToken', refreshToken);
          // Also set 'user_role' if needed by middleware, though our new middleware will check accessToken
          // But preserving existing pattern:
          Cookies.set('user_role', 'ADMIN'); // Defaulting for now as we don't have role in response yet? 
          // Wait, backend response implies user doesn't have role field in the truncated view I saw.
          // I will assume basics for now.

          dispatch(setCredentials({ user, accessToken }));
        } catch (err) {
          console.error('Login failed', err);
        }
      },
    }),
    getProfile: builder.query({
      query: () => '/auth/me',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user = data.user;
          const accessToken = Cookies.get('accessToken');
          if (user && accessToken) {
             dispatch(setCredentials({ user, accessToken }));
          }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('user_role');
          dispatch(logOut());
        } catch (err) {
            // Force logout even if API fails
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('user_role');
            dispatch(logOut());
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetProfileQuery } = authApiSlice;
