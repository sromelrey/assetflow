import { apiSlice } from './apiSlice';

export interface User {
  id: number;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    resetPassword: builder.mutation<{ id: number; temporaryPassword: string }, number>({ query: id => ({ url: `/user/${id}/reset-password`, method: 'POST' }), invalidatesTags: ['User','Employee'] }),
    getUsers: builder.query<User[], void>({
      query: () => '/user',
      providesTags: ['User'],
    }),
    upgradeEmployee: builder.mutation<User & { temporaryPassword: string }, { employeeId: number; data: { role?: string } }>({
      query: ({ employeeId, data }) => ({
        url: `/user/upgrade/${employeeId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Employee'],
    }),
  }),
});

export const {
  useResetPasswordMutation,
  useGetUsersQuery,
  useUpgradeEmployeeMutation,
} = userApi;
