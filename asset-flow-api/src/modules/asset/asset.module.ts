import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { Asset } from '@/entities/asset.entity';
import { AssetDetails } from '@/entities/asset-details.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetDetails])],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
