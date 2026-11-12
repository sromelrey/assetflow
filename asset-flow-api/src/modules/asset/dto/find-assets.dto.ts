import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAssetsDto {
  @ApiPropertyOptional({
    example: 20,
    description: 'Number of items to return per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 0,
    description: 'Last seen asset ID for cursor-based pagination',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cursor?: number;

  @ApiPropertyOptional({
    example: 'Dell Laptop',
    description: 'Search by asset name or asset number (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'DEPLOYED',
    description: 'Filter by asset status',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by site ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  siteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by building ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  buildingId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by floor ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floorId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by division ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  divisionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by department ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;
}
