import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetStatus } from '@/types/enums';
import { CreateAssetDetailsDto } from './create-asset-details.dto';

export class CreateAssetDto {
  @ApiProperty({ example: 'Dell XPS 15', description: 'Name of the asset' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'SN123456789', description: 'Serial number of the asset' })
  @IsOptional()
  @IsString()
  serialNo?: string;

  @ApiPropertyOptional({ example: 'AST-001', description: 'Unique asset identifier' })
  @IsOptional()
  @IsString()
  assetNo?: string;

  @ApiPropertyOptional({ example: 'Laptop', description: 'Type of the asset' })
  @IsOptional()
  @IsString()
  assetType?: string;

  @ApiPropertyOptional({ example: '2023-01-01', description: 'Date of purchase' })
  @IsOptional()
  @IsISO8601()
  purchaseDate?: Date;

  @ApiPropertyOptional({ enum: AssetStatus, default: AssetStatus.ACTIVE, description: 'Status of the asset' })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiProperty({ example: 1, description: 'ID of the unit this asset belongs to' })
  @IsInt()
  @IsNotEmpty()
  unitId: number;

  @ApiProperty({ example: 1, description: 'ID of the category this asset belongs to' })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiPropertyOptional({ type: CreateAssetDetailsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAssetDetailsDto)
  details?: CreateAssetDetailsDto;
}
