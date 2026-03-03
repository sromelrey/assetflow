import { apiSlice } from './apiSlice';

export interface AssetStatusLog {
  id: number;
  oldStatus: string;
  newStatus: string;
  remarks?: string;
  createdAt: string;
  asset: {
    id: number;
    name: string;
    assetNo?: string;
  };
}

export const assetsHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssetStatusHistory: builder.query<AssetStatusLog[], number | void>({
      query: (assetId) => assetId ? `/asset/${assetId}/status-history` : '/asset/status-history',
      providesTags: ['Asset'],
    }),
  }),
});

export const { useGetAssetStatusHistoryQuery } = assetsHistoryApi;
