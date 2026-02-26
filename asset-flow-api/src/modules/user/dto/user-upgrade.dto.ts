import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserUpgradeDto {
  @ApiPropertyOptional({ example: 'standard', description: 'Initial role for the upgraded user' })
  @IsOptional()
  @IsString()
  role?: string;
}
