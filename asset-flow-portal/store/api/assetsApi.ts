import { apiSlice } from './apiSlice';
import { Unit } from './organizationApi';
import { Category } from './categoriesApi';

// Note: Ensure `Unit` and `Category` are exported from their respective APIs.
// Assuming they are, we import them here for strong typing.

export type AssetStatus = 'Active' | 'Inactive' | 'Under Maintenance' | 'Retired';

export interface AssetDetails {
  id: number;
  brand?: string;
  model?: string;
  ipAddress?: string;
  macAddress?: string;
  computerName?: string;
  operatingSystem?: string;
  processor?: string;
  memory?: string;
  storage?: string;
  graphics?: string;
  poNumber?: string;
  supplier?: string;
  warrantyExpiry?: string;
  invoiceNumber?: string;
  manufacturingDate?: string;
  remarks?: string;
  assetId?: number; // Depending on frontend needs, might omit or keep
}

export interface Asset {
  id: number;
  name: string;
  serialNo?: string;
  assetNo?: string;
  assetType?: string;
  purchaseDate?: string;
  status: AssetStatus;
  unit: Unit;
  category: Category;
  assetDetails?: AssetDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetDto {
  name: string;
  serialNo?: string;
  assetNo?: string;
  assetType?: string;
  purchaseDate?: string;
  status?: AssetStatus;
  unitId: number;
  categoryId: number;
  details?: Omit<AssetDetails, 'id' | 'assetId'>;
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {}

export interface FindAssetsDto {
  limit?: number;
  cursor?: number;
}

export const assetsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<Asset[], FindAssetsDto | void>({
      query: (params) => ({
        url: '/asset',
        params: params || {},
      }),
      providesTags: ['Asset'],
    }),
    
    getAssetById: builder.query<Asset, number>({
      query: (id) => `/asset/${id}`,
      providesTags: (result, error, id) => [{ type: 'Asset', id }],
    }),

    createAsset: builder.mutation<Asset, CreateAssetDto>({
      query: (body) => ({
        url: '/asset',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Asset'],
    }),

    updateAsset: builder.mutation<Asset, { id: number; data: UpdateAssetDto }>({
      query: ({ id, data }) => ({
        url: `/asset/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Asset' as const, id }, 'Asset'],
    }),

    deleteAsset: builder.mutation<void, number>({
      query: (id) => ({
        url: `/asset/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Asset'],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetByIdQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi;
