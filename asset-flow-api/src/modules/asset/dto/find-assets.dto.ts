import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAssetsDto {
  @ApiPropertyOptional({ example: 10, description: 'Number of items to return' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 0, description: 'The ID to start from (cursor-based)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cursor?: number;
}
