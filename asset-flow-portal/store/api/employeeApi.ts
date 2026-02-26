import { apiSlice } from './apiSlice';

export interface Employee {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  status: string;
  dateHired?: string;
  employmentType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: string;
  dateHired?: string;
  employmentType?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employee',
      providesTags: ['Employee'],
    }),
    getEmployee: builder.query<Employee, number>({
      query: (id) => `/employee/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<Employee, CreateEmployeeDto>({
      query: (body) => ({
        url: '/employee',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<Employee, { id: number; data: UpdateEmployeeDto }>({
      query: ({ id, data }) => ({
        url: `/employee/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        'Employee',
      ],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `/employee/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
