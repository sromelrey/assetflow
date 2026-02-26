import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAssetsDto } from './dto/find-assets.dto';
import { UpdateAssetStatusDto } from './dto/update-asset-status.dto';
import { Asset } from '@/entities/asset.entity';
import { AssetDetails } from '@/entities/asset-details.entity';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetDetails)
    private readonly assetDetailsRepository: Repository<AssetDetails>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createAssetDto: CreateAssetDto) {
    const { unitId, categoryId, details, ...rest } = createAssetDto;

    if (rest.serialNo) {
      const existingSerial = await this.assetRepository.findOne({ where: { serialNo: rest.serialNo } });
      if (existingSerial) {
        throw new ConflictException(`Asset with serial number ${rest.serialNo} already exists`);
      }
    }

    if (rest.assetNo) {
      const existingAssetNo = await this.assetRepository.findOne({ where: { assetNo: rest.assetNo } });
      if (existingAssetNo) {
        throw new ConflictException(`Asset with asset number ${rest.assetNo} already exists`);
      }
    }
    
    return await this.dataSource.transaction(async (manager) => {
      this.logger.log('--- Asset Create Transaction Starting ---');
      const asset = manager.create(Asset, {
        ...rest,
        unit: { id: unitId },
        category: { id: categoryId },
      } as any);

      const savedAsset = await manager.save(Asset, asset);
      this.logger.log(`✅ Asset saved with ID: ${savedAsset.id}`);

      if (details) {
        this.logger.log(`📦 Saving details for Asset ID: ${savedAsset.id}`);
        const assetDetails = manager.create(AssetDetails, {
          ...details,
          assetId: { id: savedAsset.id },
        } as any);
        await manager.save(AssetDetails, assetDetails);
      }

      const result = await manager.findOne(Asset, {
        where: { id: savedAsset.id } as any,
        relations: ['unit', 'category', 'assetDetails'],
      });

      if (!result) {
        this.logger.error(`❌ CRITICAL: Could not find asset with ID ${savedAsset.id} inside transaction!`);
        throw new NotFoundException(`Asset with ID ${savedAsset.id} not found (after save)`);
      }

      this.logger.log('--- Asset Create Transaction Successful ---');
      return result;
    });
  }

  findAll(query: FindAssetsDto) {
    const { limit = 10, cursor } = query;
    
    return this.assetRepository.find({
      where: cursor ? { id: MoreThan(cursor) } : {},
      take: limit,
      order: { id: 'ASC' } as any,
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
    
    // Ensure asset exists first
    await this.findOne(id);

    if (rest.serialNo) {
      const existingSerial = await this.assetRepository.findOne({ where: { serialNo: rest.serialNo } });
      if (existingSerial && existingSerial.id !== id) {
        throw new ConflictException(`Asset with serial number ${rest.serialNo} already exists`);
      }
    }

    if (rest.assetNo) {
      const existingAssetNo = await this.assetRepository.findOne({ where: { assetNo: rest.assetNo } });
      if (existingAssetNo && existingAssetNo.id !== id) {
        throw new ConflictException(`Asset with asset number ${rest.assetNo} already exists`);
      }
    }

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
    // Ensure asset exists first
    await this.findOne(id);

    return await this.dataSource.transaction(async (manager) => {
      // Delete details first to avoid FK constraint issues if manual deletion is required
      await manager.delete(AssetDetails, { assetId: { id } } as any);
      
      const result = await manager.delete(Asset, id);
      if (result.affected === 0) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }
      return { message: `Asset #${id} removed successfully` };
    });
  }
  async findByAssetNo(assetNo: string) {
    const asset = await this.assetRepository.findOne({
      where: { assetNo },
      relations: ['unit', 'category', 'assetDetails'],
    });
    if (!asset) {
      throw new NotFoundException(`Asset with asset number ${assetNo} not found`);
    }
    return asset;
  }

  async updateStatusByAssetNo(assetNo: string, updateStatusDto: UpdateAssetStatusDto) {
    const asset = await this.findByAssetNo(assetNo);
    await this.assetRepository.update(asset.id, { status: updateStatusDto.status });
    
    return this.findOne(asset.id);
  }
}
