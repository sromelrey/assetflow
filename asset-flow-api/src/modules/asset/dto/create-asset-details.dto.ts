import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsObject, IsString } from 'class-validator';

export class CreateAssetDetailsDto {
  @ApiPropertyOptional({ example: 'Apple', description: 'Brand of the asset' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'MacBook Pro', description: 'Model of the asset' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'IP Address of the asset' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'TECH-MBP-01', description: 'Computer name' })
  @IsOptional()
  @IsString()
  computerName?: string;

  @ApiPropertyOptional({ example: 'macOS Sonoma', description: 'Operating system' })
  @IsOptional()
  @IsString()
  operatingSystem?: string;

  @ApiPropertyOptional({ example: 'M3 Pro', description: 'Processor details' })
  @IsOptional()
  @IsString()
  processor?: string;

  @ApiPropertyOptional({ example: '16GB', description: 'Memory details' })
  @IsOptional()
  @IsString()
  memory?: string;

  @ApiPropertyOptional({ example: '512GB SSD', description: 'Storage details' })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional({ example: 'PO-2023-001', description: 'Purchase Order number' })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiPropertyOptional({ example: '2023-01-01', description: 'Manufacturing date' })
  @IsOptional()
  @IsDateString()
  manufacturingDate?: Date;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Preventive Maintenance date' })
  @IsOptional()
  @IsDateString()
  pmDate?: Date;

  @ApiPropertyOptional({ example: '123456789012345', description: 'IMEI for mobile devices' })
  @IsOptional()
  @IsString()
  imei?: string;

  @ApiPropertyOptional({ example: { "warranty": "3 years" }, description: 'Flexible metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: 'New laptop for development', description: 'General remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
