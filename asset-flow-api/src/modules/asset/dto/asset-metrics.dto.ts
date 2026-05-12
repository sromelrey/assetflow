import { ApiProperty } from '@nestjs/swagger';

export class StatusDistributionItem {
  @ApiProperty({ example: 'Active', description: 'The asset status' })
  status: string;

  @ApiProperty({ example: 45, description: 'Count of assets with this status' })
  count: number;
}

export class CategoryDistributionItem {
  @ApiProperty({ example: 'Laptops', description: 'The category name' })
  category: string;

  @ApiProperty({
    example: 120,
    description: 'Count of assets in this category',
  })
  count: number;
}

export class AcquisitionTrendItem {
  @ApiProperty({
    example: 'Jan',
    description: 'The month of acquisition (MMM format)',
  })
  month: string;

  @ApiProperty({
    example: 15,
    description: 'Number of assets acquired in this month',
  })
  count: number;
}

export class AssetMetricsDto {
  @ApiProperty({
    example: 250,
    description: 'Total number of assets in the system',
  })
  totalAssets: number;

  @ApiProperty({
    example: 120,
    description: 'Number of active/deployed assets',
  })
  active: number;

  @ApiProperty({
    example: 10,
    description: 'Number of assets currently under maintenance/repair',
  })
  underMaintenance: number;

  @ApiProperty({
    example: 5,
    description: 'Number of retired/decommissioned assets',
  })
  retired: number;

  @ApiProperty({
    type: [StatusDistributionItem],
    description: 'Asset distribution by status',
  })
  statusDistribution: StatusDistributionItem[];

  @ApiProperty({
    type: [CategoryDistributionItem],
    description: 'Asset distribution by category',
  })
  categoryDistribution: CategoryDistributionItem[];

  @ApiProperty({
    type: [AcquisitionTrendItem],
    description: 'Acquisition trend over the last 6 months',
  })
  acquisitionTrend: AcquisitionTrendItem[];
}
