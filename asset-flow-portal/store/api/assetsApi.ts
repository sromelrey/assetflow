import { apiSlice } from './apiSlice';
import { Unit } from './organizationApi';
import { Category } from './categoriesApi';

// Note: Ensure `Unit` and `Category` are exported from their respective APIs.
// Assuming they are, we import them here for strong typing.

export type AssetStatus = 'Active' | 'Decommissioned' | 'Deployed' | 'For Repair' | 'For Deployment' | 'In Storage';

export interface DesktopMetadata {
  hasMouse?: boolean;
  hasKeyboard?: boolean;
  hasAntivirus?: boolean;
}

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
  metadata?: Record<string, unknown> | DesktopMetadata;
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
  inventoryId?: number;
  details?: Omit<AssetDetails, 'id' | 'assetId'>;
}

export type UpdateAssetDto = Partial<CreateAssetDto>;

export interface FindAssetsDto {
  limit?: number;
  cursor?: number;
  search?: string;
  status?: AssetStatus;
  categoryId?: number;
  siteId?: number;
  buildingId?: number;
  floorId?: number;
  divisionId?: number;
  departmentId?: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
}

export interface AcquisitionTrendItem {
  month: string;
  count: number;
}

export interface AssetMetrics {
  totalAssets: number;
  active: number;
  underMaintenance: number;
  retired: number;
  statusDistribution: StatusDistributionItem[];
  categoryDistribution: CategoryDistributionItem[];
  acquisitionTrend: AcquisitionTrendItem[];
}

export const assetsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<Asset[], FindAssetsDto | void>({
      query: (params) => ({
        url: '/asset',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Asset' as const, id })),
              { type: 'Asset', id: 'LIST' },
            ]
          : [{ type: 'Asset', id: 'LIST' }],
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
      invalidatesTags: [{ type: 'Asset', id: 'LIST' }, 'Inventory'],
    }),

    updateAsset: builder.mutation<Asset, { id: number; data: UpdateAssetDto }>({
      query: ({ id, data }) => ({
        url: `/asset/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Asset', id }, { type: 'Asset', id: 'LIST' }],
    }),

    deleteAsset: builder.mutation<void, number>({
      query: (id) => ({
        url: `/asset/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Asset', id }, { type: 'Asset', id: 'LIST' }],
    }),

    getAssetByAssetNo: builder.query<Asset, string>({
      query: (assetNo) => `/asset/find-by-no/${assetNo}`,
      providesTags: (result, error, arg) => result ? [{ type: 'Asset', id: result.id }] : ['Asset'],
    }),

    updateAssetStatusByNo: builder.mutation<Asset, { assetNo: string; status: AssetStatus }>({
      query: ({ assetNo, status }) => ({
        url: `/asset/status-by-no/${assetNo}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result) => result ? [{ type: 'Asset', id: result.id }, { type: 'Asset', id: 'LIST' }] : [{ type: 'Asset', id: 'LIST' }],
    }),

    getAssetMetrics: builder.query<AssetMetrics, number | string | void>({
      query: (siteId) => ({
        url: '/asset/metrics',
        params: siteId ? { siteId } : {},
      }),
      providesTags: ['Asset'],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetByIdQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useGetAssetByAssetNoQuery,
  useUpdateAssetStatusByNoMutation,
  useGetAssetMetricsQuery,
} = assetsApi;
