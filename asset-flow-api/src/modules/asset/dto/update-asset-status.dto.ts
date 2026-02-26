import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AssetStatus } from '@/types/enums';

export class UpdateAssetStatusDto {
  @ApiProperty({ enum: AssetStatus, description: 'New status for the asset' })
  @IsEnum(AssetStatus)
  @IsNotEmpty()
  status: AssetStatus;
}
