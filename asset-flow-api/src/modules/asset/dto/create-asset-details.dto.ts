import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsObject, IsString } from 'class-validator';

export class CreateAssetDetailsDto {
  @ApiProperty({ example: 'Apple', description: 'Brand of the asset' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'MacBook Pro', description: 'Model of the asset' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: '192.168.1.1', description: 'IP Address of the asset' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'TECH-MBP-01', description: 'Computer name' })
  @IsString()
  @IsNotEmpty()
  computerName: string;

  @ApiProperty({ example: 'macOS Sonoma', description: 'Operating system' })
  @IsString()
  @IsNotEmpty()
  operatingSystem: string;

  @ApiProperty({ example: 'M3 Pro', description: 'Processor details' })
  @IsString()
  @IsNotEmpty()
  processor: string;

  @ApiProperty({ example: '16GB', description: 'Memory details' })
  @IsString()
  @IsNotEmpty()
  memory: string;

  @ApiProperty({ example: '512GB SSD', description: 'Storage details' })
  @IsString()
  @IsNotEmpty()
  storage: string;

  @ApiProperty({ example: 'PO-2023-001', description: 'Purchase Order number' })
  @IsString()
  @IsNotEmpty()
  poNumber: string;

  @ApiProperty({ example: '2023-01-01', description: 'Manufacturing date' })
  @IsDateString()
  @IsNotEmpty()
  manufacturingDate: Date;

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

  @ApiProperty({ example: 'New laptop for development', description: 'General remarks' })
  @IsString()
  @IsNotEmpty()
  remarks: string;
}
