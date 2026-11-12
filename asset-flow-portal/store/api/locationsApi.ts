import { apiSlice } from './apiSlice';

export interface Site {
  id: number;
  name: string;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteDto {
  name: string;
  address?: string;
}

export interface UpdateSiteDto {
  name?: string;
  address?: string;
}

export interface Building {
  id: number;
  name: string;
  siteId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuildingDto {
  name: string;
  siteId: number;
}

export interface UpdateBuildingDto {
  name?: string;
}

export interface Floor {
  id: number;
  floorNumber: string;
  buildingId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFloorDto {
  floorNumber: string;
  buildingId: number;
}

export interface UpdateFloorDto {
  floorNumber?: string;
}

export const locationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Sites
    getSites: builder.query<Site[], void>({
      query: () => '/site',
      providesTags: ['Site'],
    }),
    createSite: builder.mutation<Site, CreateSiteDto>({
      query: (body) => ({
        url: '/site',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Site'],
    }),
    updateSite: builder.mutation<Site, { id: number; data: UpdateSiteDto }>({
      query: ({ id, data }) => ({
        url: `/site/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Site'],
    }),
    deleteSite: builder.mutation<void, number>({
      query: (id) => ({
        url: `/site/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Site'],
    }),

    // Buildings
    getBuildings: builder.query<Building[], { siteId?: number } | void>({
      query: (params) => ({
        url: '/building',
        params: params || {},
      }),
      providesTags: ['Building'],
    }),
    createBuilding: builder.mutation<Building, CreateBuildingDto>({
      query: (body) => ({
        url: '/building',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Building'],
    }),
    updateBuilding: builder.mutation<Building, { id: number; data: UpdateBuildingDto }>({
      query: ({ id, data }) => ({
        url: `/building/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Building'],
    }),
    deleteBuilding: builder.mutation<void, number>({
      query: (id) => ({
        url: `/building/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Building'],
    }),

    // Floors
    getFloors: builder.query<Floor[], { buildingId?: number } | void>({
      query: (params) => ({
        url: '/floor',
        params: params || {},
      }),
      providesTags: ['Floor'],
    }),
    createFloor: builder.mutation<Floor, CreateFloorDto>({
      query: (body) => ({
        url: '/floor',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Floor'],
    }),
    updateFloor: builder.mutation<Floor, { id: number; data: UpdateFloorDto }>({
      query: ({ id, data }) => ({
        url: `/floor/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Floor'],
    }),
    deleteFloor: builder.mutation<void, number>({
      query: (id) => ({
        url: `/floor/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Floor'],
    }),
  }),
});

export const {
  useGetSitesQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
  useGetBuildingsQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  useGetFloorsQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
} = locationsApi;
