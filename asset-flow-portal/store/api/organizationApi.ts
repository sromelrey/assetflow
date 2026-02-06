import { apiSlice } from './apiSlice';
import { Floor } from './locationsApi';

// Division interfaces
export interface Division {
  id: number;
  name: string;
  status: string;
  floor?: Floor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDivisionDto {
  name: string;
  status?: string;
  floorId: number;
}

export interface UpdateDivisionDto {
  name?: string;
  status?: string;
  floorId?: number;
}

// Department interfaces
export interface Department {
  id: number;
  name: string;
  divisionId?: Division;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  divisionId: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  divisionId?: number;
}

// Unit interfaces
export interface Unit {
  id: number;
  name: string;
  departmentId?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitDto {
  name: string;
  departmentId: number;
}

export interface UpdateUnitDto {
  name?: string;
  departmentId?: number;
}

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Divisions
    getDivisions: builder.query<Division[], { floorId?: number } | void>({
      query: (params) => {
        const queryParams = params?.floorId ? `?floorId=${params.floorId}` : '';
        return `/division${queryParams}`;
      },
      providesTags: ['Division'],
    }),
    createDivision: builder.mutation<Division, CreateDivisionDto>({
      query: (body) => ({
        url: '/division',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Division'],
    }),
    updateDivision: builder.mutation<Division, { id: number; data: UpdateDivisionDto }>({
      query: ({ id, data }) => ({
        url: `/division/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Division'],
    }),
    deleteDivision: builder.mutation<void, number>({
      query: (id) => ({
        url: `/division/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Division'],
    }),

    // Departments
    getDepartments: builder.query<Department[], { divisionId?: number } | void>({
      query: (params) => {
        const queryParams = params?.divisionId ? `?divisionId=${params.divisionId}` : '';
        return `/department${queryParams}`;
      },
      providesTags: ['Department'],
    }),
    createDepartment: builder.mutation<Department, CreateDepartmentDto>({
      query: (body) => ({
        url: '/department',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation<Department, { id: number; data: UpdateDepartmentDto }>({
      query: ({ id, data }) => ({
        url: `/department/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),
    deleteDepartment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/department/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),

    // Units
    getUnits: builder.query<Unit[], { departmentId?: number } | void>({
      query: (params) => {
        const queryParams = params?.departmentId ? `?departmentId=${params.departmentId}` : '';
        return `/unit${queryParams}`;
      },
      providesTags: ['Unit'],
    }),
    createUnit: builder.mutation<Unit, CreateUnitDto>({
      query: (body) => ({
        url: '/unit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Unit'],
    }),
    updateUnit: builder.mutation<Unit, { id: number; data: UpdateUnitDto }>({
      query: ({ id, data }) => ({
        url: `/unit/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Unit'],
    }),
    deleteUnit: builder.mutation<void, number>({
      query: (id) => ({
        url: `/unit/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Unit'],
    }),
  }),
});

export const {
  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = organizationApi;
