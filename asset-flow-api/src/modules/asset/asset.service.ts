import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from '@/entities/asset.entity';
import { AssetDetails } from '@/entities/asset-details.entity';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetDetails)
    private readonly assetDetailsRepository: Repository<AssetDetails>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createAssetDto: CreateAssetDto) {
    const { unitId, categoryId, details, ...rest } = createAssetDto;
    
    return await this.dataSource.transaction(async (manager) => {
      console.log('--- Asset Create Transaction Starting ---');
      const asset = manager.create(Asset, {
        ...rest,
        unit: { id: unitId },
        category: { id: categoryId },
      } as any);

      const savedAsset = await manager.save(Asset, asset);
      console.log(`✅ Asset saved with ID: ${savedAsset.id}`);

      if (details) {
        console.log(`📦 Saving details for Asset ID: ${savedAsset.id}`);
        const assetDetails = manager.create(AssetDetails, {
          ...details,
          assetId: { id: savedAsset.id },
        } as any);
        await manager.save(AssetDetails, assetDetails);
      }

      console.log(`🔍 Fetching created asset with relations for ID: ${savedAsset.id}`);
      const result = await manager.findOne(Asset, {
        where: { id: savedAsset.id } as any,
        relations: ['unit', 'category', 'assetDetails'],
      });

      if (!result) {
        console.error(`❌ CRITICAL: Could not find asset with ID ${savedAsset.id} inside transaction!`);
        // If this happens, it's likely a transaction isolation issue or relation error
        throw new NotFoundException(`Asset with ID ${savedAsset.id} not found (after save)`);
      }

      console.log('--- Asset Create Transaction Successful ---');
      return result;
    });
  }

  findAll() {
    return this.assetRepository.find({
      relations: ['unit', 'category', 'assetDetails'],
    });
  }

  async findOne(id: number) {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ['unit', 'category', 'assetDetails'],
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    const { unitId, categoryId, details, ...rest } = updateAssetDto;
    
    return await this.dataSource.transaction(async (manager) => {
      const updateData: any = { ...rest };
      
      if (unitId) {
        updateData.unit = { id: unitId };
      }
      if (categoryId) {
        updateData.category = { id: categoryId };
      }

      if (Object.keys(updateData).length > 0) {
        await manager.update(Asset, id, updateData);
      }

      if (details) {
        const existingDetails = await manager.findOne(AssetDetails, {
          where: { assetId: { id } } as any,
        });

        if (existingDetails) {
          await manager.update(AssetDetails, existingDetails.id, details);
        } else {
          const newDetails = manager.create(AssetDetails, {
            ...details,
            assetId: { id },
          } as any);
          await manager.save(AssetDetails, newDetails);
        }
      }

      return manager.findOne(Asset, {
        where: { id } as any,
        relations: ['unit', 'category', 'assetDetails'],
      });
    });
  }

  async remove(id: number) {
    // Note: If ON DELETE CASCADE is set on AssetDetails relation, we don't need manual deletion.
    // However, to be safe and explicit:
    await this.assetDetailsRepository.delete({ assetId: { id } } as any);
    const result = await this.assetRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return { message: `Asset #${id} removed successfully` };
  }
}
