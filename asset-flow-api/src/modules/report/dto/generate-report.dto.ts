import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ReportType } from '@/entities/report.entity';

export enum DateType {
  CREATION = 'CREATION',
  DEPLOYMENT = 'DEPLOYMENT',
  PURCHASE = 'PURCHASE',
}

export class GenerateReportDto {
  @ApiProperty({ enum: ReportType, description: 'Type of report to generate' })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiPropertyOptional({ type: [Number], description: 'Site IDs to filter by' })
  @IsArray()
  @IsOptional()
  siteIds?: number[];

  @ApiPropertyOptional({
    type: [Number],
    description: 'Category IDs to filter by',
  })
  @IsArray()
  @IsOptional()
  categoryIds?: number[];

  @ApiPropertyOptional({ description: 'Date range for filtering' })
  @IsOptional()
  dateRange?: {
    startDate: string;
    endDate: string;
    dateType: DateType;
  };

  @ApiPropertyOptional({
    description: 'Whether to save report to history',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  saveToHistory?: boolean;
}
