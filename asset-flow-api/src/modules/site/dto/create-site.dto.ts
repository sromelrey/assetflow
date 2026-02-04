import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Main Campus', description: 'Name of the site' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '123 Main St, City', description: 'Address of the site' })
  @IsOptional()
  @IsString()
  address?: string;
}
