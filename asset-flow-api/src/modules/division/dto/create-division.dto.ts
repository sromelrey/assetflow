import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDivisionDto {
  @ApiProperty({ example: 'Operations', description: 'Name of the division' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'active', description: 'Status of the division' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 1, description: 'ID of the floor this division belongs to' })
  @IsInt()
  @IsNotEmpty()
  floorId: number;
}
