import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    example: 'SKU-001',
    description: 'Stock Keeping Unit / Item Code',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    example: 'Dell XPS 15 Laptop',
    description: 'Name of the inventory item',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '15.6 inch laptop with 16GB RAM',
    description: 'Description of the inventory item',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 50,
    description: 'Current stock quantity',
    default: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 1299.99, description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({
    example: 10,
    description: 'Minimum stock level for alerts',
    default: 0,
  })
  @IsInt()
  @Min(0)
  minStockLevel: number;

  @ApiPropertyOptional({ example: 1, description: 'ID of the category' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID of the unit/location' })
  @IsOptional()
  @IsInt()
  unitId?: number;
}
