import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { Asset } from '@/entities/asset.entity';
import { AssetDetails } from '@/entities/asset-details.entity';
import { AssetStatusLog } from '@/entities/asset-status-log.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetDetails, AssetStatusLog]),
    InventoryModule,
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
