import { apiSlice } from './apiSlice';

export enum ReportType {
  SUMMARY = 'SUMMARY',
  DEPLOYED = 'DEPLOYED',
  ON_HAND = 'ON_HAND',
  PER_DEPARTMENT = 'PER_DEPARTMENT',
  PER_LOCATION = 'PER_LOCATION',
  LIFECYCLE = 'LIFECYCLE',
  REPAIR_MAINTENANCE = 'REPAIR_MAINTENANCE',
  DISPOSAL = 'DISPOSAL',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum DateType {
  CREATION = 'CREATION',
  DEPLOYMENT = 'DEPLOYMENT',
  PURCHASE = 'PURCHASE',
}

export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

export interface Report {
  id: number;
  reportName: string;
  reportType: ReportType;
  generatedBy: {
    id: number;
    name: string;
    email: string;
  };
  filtersJson?: Record<string, any>;
  reportDataJson?: Record<string, any>;
  exportFilePaths?: Record<string, string>;
  status: ReportStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateReportDto {
  reportType: ReportType;
  siteIds?: number[];
  categoryIds?: number[];
  dateRange?: {
    startDate: string;
    endDate: string;
    dateType: DateType;
  };
  saveToHistory?: boolean;
}

export interface ReportQueryDto {
  page?: number;
  limit?: number;
  reportType?: ReportType;
  status?: ReportStatus;
}

export interface ExportReportDto {
  reportId: number;
  format: ExportFormat;
}

export interface ReportListResponse {
  data: Report[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.mutation<any, GenerateReportDto>({
      query: (body) => ({
        url: '/report/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Report'],
    }),

    getReports: builder.query<ReportListResponse, ReportQueryDto | void>({
      query: (params) => ({
        url: '/report',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Report' as const, id })),
              { type: 'Report', id: 'LIST' },
            ]
          : [{ type: 'Report', id: 'LIST' }],
    }),

    getReportById: builder.query<Report, number>({
      query: (id) => `/report/${id}`,
      providesTags: (result, error, id) => [{ type: 'Report', id }],
    }),

    exportReport: builder.mutation<any, ExportReportDto>({
      query: (body) => ({
        url: '/report/export',
        method: 'POST',
        body,
      }),
    }),

    deleteReport: builder.mutation<void, number>({
      query: (id) => ({
        url: `/report/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGenerateReportMutation,
  useGetReportsQuery,
  useGetReportByIdQuery,
  useExportReportMutation,
  useDeleteReportMutation,
} = reportsApi;
