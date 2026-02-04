import { PartialType } from '@nestjs/swagger';
import { CreateAssetDetailsDto } from './create-asset-details.dto';

export class UpdateAssetDetailsDto extends PartialType(CreateAssetDetailsDto) {}
