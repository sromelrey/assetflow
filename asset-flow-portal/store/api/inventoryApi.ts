import { apiSlice } from './apiSlice';

export interface Inventory {
  id: number;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  minStockLevel: number;
  category?: {
    id: number;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: number;
  inventory: {
    id: number;
    name: string;
    sku: string;
  };
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: number;
  changedBy?: {
    id: number;
    email?: string;
  };
  createdAt: string;
}

export interface CreateInventoryDto {
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  minStockLevel: number;
  categoryId?: number;
  unitId?: number;
}

export interface UpdateInventoryDto {
  sku?: string;
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  minStockLevel?: number;
  categoryId?: number;
  unitId?: number;
}

export interface AdjustStockDto {
  quantity: number;
  reason: string;
}

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<Inventory[], void>({
      query: () => '/inventory',
      providesTags: ['Inventory'],
    }),
    getInventoryById: builder.query<Inventory, number>({
      query: (id) => `/inventory/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),
    createInventory: builder.mutation<Inventory, CreateInventoryDto>({
      query: (body) => ({
        url: '/inventory',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),
    updateInventory: builder.mutation<Inventory, { id: number; data: UpdateInventoryDto }>({
      query: ({ id, data }) => ({
        url: `/inventory/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }, 'Inventory'],
    }),
    deleteInventory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
    adjustStock: builder.mutation<Inventory, { id: number; data: AdjustStockDto; userId?: number }>({
      query: ({ id, data, userId }) => ({
        url: `/inventory/${id}/adjust-stock${userId ? `?userId=${userId}` : ''}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }, 'Inventory'],
    }),
    getInventoryHistory: builder.query<InventoryLog[], number>({
      query: (id) => `/inventory/${id}/history`,
      providesTags: (result, error, id) => [{ type: 'InventoryHistory', id }],
    }),
    getLowStockItems: builder.query<Inventory[], void>({
      query: () => '/inventory/low-stock',
      providesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useAdjustStockMutation,
  useGetInventoryHistoryQuery,
  useGetLowStockItemsQuery,
} = inventoryApi;
