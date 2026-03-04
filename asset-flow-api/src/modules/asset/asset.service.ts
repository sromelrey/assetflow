import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAssetsDto } from './dto/find-assets.dto';
import { AssetMetricsDto } from './dto/asset-metrics.dto';
import { UpdateAssetStatusDto } from './dto/update-asset-status.dto';
import { Asset } from '@/entities/asset.entity';
import { AssetDetails } from '@/entities/asset-details.entity';
import { AssetStatusLog } from '@/entities/asset-status-log.entity';
import { AssetStatus } from '@/types/enums';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetDetails)
    private readonly assetDetailsRepository: Repository<AssetDetails>,
    @InjectRepository(AssetStatusLog)
    private readonly assetStatusLogRepository: Repository<AssetStatusLog>,
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

  /**
   * Retrieves a paginated, filtered list of assets using cursor-based pagination.
   *
   * @param query - Pagination and filter options
   * @returns Array of matching Asset entities with full hierarchy relations
   */
  findAll(query: FindAssetsDto) {
    const { limit = 20, cursor, search, status, categoryId, siteId, buildingId, floorId, divisionId, departmentId } = query;

    const qb = this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.unit', 'unit')
      .leftJoinAndSelect('unit.departmentId', 'department')
      .leftJoinAndSelect('department.divisionId', 'division')
      .leftJoinAndSelect('division.floor', 'floor')
      .leftJoinAndSelect('floor.building', 'building')
      .leftJoinAndSelect('building.site', 'site')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.assetDetails', 'assetDetails')
      .orderBy('asset.id', 'ASC')
      .take(limit);

    if (cursor)       qb.andWhere('asset.id > :cursor',              { cursor });
    if (search) {
      qb.andWhere(
        '(asset.name ILIKE :q OR asset.assetNo ILIKE :q OR COALESCE(category.name, \'\') ILIKE :q OR asset.status::text ILIKE :q OR COALESCE(unit.name, \'\') ILIKE :q OR COALESCE(department.name, \'\') ILIKE :q OR COALESCE(building.name, \'\') ILIKE :q OR COALESCE(site.name, \'\') ILIKE :q)',
        { q: `%${search}%` }
      );
    }
    if (status)       qb.andWhere('asset.status = :status',          { status });
    if (categoryId)   qb.andWhere('category.id = :categoryId',       { categoryId });
    if (siteId)       qb.andWhere('site.id = :siteId',               { siteId });
    if (buildingId)   qb.andWhere('building.id = :buildingId',       { buildingId });
    if (floorId)      qb.andWhere('floor.id = :floorId',             { floorId });
    if (divisionId)   qb.andWhere('division.id = :divisionId',       { divisionId });
    if (departmentId) qb.andWhere('department.id = :departmentId',   { departmentId });

    return qb.getMany();
  }

  /**
   * Aggregates dashboard metrics for the assets including status and category distributions,
   * total counts by bucket, and a 6-month acquisition trend.
   *
   * @param siteId Optional site ID to filter metrics
   * @returns Promise resolving to an AssetMetricsDto
   */
  async getMetrics(siteId?: number): Promise<AssetMetricsDto> {
    
    // Helper to build a base query builder with the site filter if provided
    const getBaseQuery = () => {
      const q = this.assetRepository.createQueryBuilder('asset')
        .leftJoin('asset.unit', 'unit')
        .leftJoin('unit.departmentId', 'department')
        .leftJoin('department.divisionId', 'division')
        .leftJoin('division.floor', 'floor')
        .leftJoin('floor.building', 'building')
        .leftJoin('building.site', 'site');

      if (siteId) {
        q.andWhere('site.id = :siteId', { siteId });
      }
      return q;
    };

    const [
      totalAssets,
      active,
      underMaintenance,
      retired,
      statusDistRaw,
      categoryDistRaw,
      trendRaw
    ] = await Promise.all([
      getBaseQuery().getCount(),

      getBaseQuery()
        .andWhere('(asset.status = :active OR asset.status = :deployed)', { 
          active: AssetStatus.ACTIVE, deployed: AssetStatus.DEPLOYED 
        })
        .getCount(),

      getBaseQuery()
        .andWhere('asset.status = :repair', { repair: AssetStatus.FOR_REPAIR })
        .getCount(),

      getBaseQuery()
        .andWhere('asset.status = :retired', { retired: AssetStatus.DECOMMISSIONED })
        .getCount(),

      getBaseQuery()
        .select('asset.status', 'status')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('asset.status')
        .getRawMany(),

      getBaseQuery()
        .leftJoin('asset.category', 'category')
        .select('category.name', 'category')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('category.name')
        .getRawMany(),

      // Acquisition trend (last 6 months)
      getBaseQuery()
        .select("TO_CHAR(asset.created_at, 'Mon')", 'month')
        .addSelect("TO_CHAR(asset.created_at, 'YYYY-MM')", 'sortKey')
        .addSelect('COUNT(*)::int', 'count')
        .andWhere("asset.created_at >= NOW() - INTERVAL '6 months'")
        .groupBy("TO_CHAR(asset.created_at, 'Mon')")
        .addGroupBy("TO_CHAR(asset.created_at, 'YYYY-MM')")
        .orderBy("TO_CHAR(asset.created_at, 'YYYY-MM')", 'ASC')
        .getRawMany()
    ]);

    return {
      totalAssets,
      active,
      underMaintenance,
      retired,
      statusDistribution: statusDistRaw.map(s => ({
        status: s.status,
        count: Number(s.count) || 0,
      })),
      categoryDistribution: categoryDistRaw.map(c => ({
        category: c.category || 'Uncategorized',
        count: Number(c.count) || 0,
      })),
      acquisitionTrend: trendRaw.map(t => ({
        month: t.month,
        count: Number(t.count) || 0,
      })),
    };
  }

  async findOne(id: number) {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: [
        'unit',
        'unit.departmentId',
        'unit.departmentId.divisionId',
        'unit.departmentId.divisionId.floor',
        'unit.departmentId.divisionId.floor.building',
        'unit.departmentId.divisionId.floor.building.site',
        'category',
        'assetDetails',
      ],
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  async update(id: number, updateAssetDto: UpdateAssetDto, userId?: number) {
    const { unitId, categoryId, details, ...rest } = updateAssetDto;
    
    // Ensure asset exists first
    const asset = await this.findOne(id);

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

      if (updateData.status && updateData.status !== asset.status) {
        this.logger.log(`📝 Logging status change for asset ${id} by user ID: ${userId || 'unknown'}`);
        const log = manager.create(AssetStatusLog, {
          asset: { id },
          oldStatus: asset.status,
          newStatus: updateData.status,
          changedBy: userId ? { id: userId } : undefined,
        } as any);
        await manager.save(AssetStatusLog, log);
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

  async updateStatusByAssetNo(assetNo: string, updateStatusDto: UpdateAssetStatusDto, userId?: number) {
    const asset = await this.findByAssetNo(assetNo);
    
    if (asset.status !== updateStatusDto.status) {
      this.logger.log(`📝 Logging status change (by scan) for asset ${asset.id} by user ID: ${userId || 'unknown'}`);
      await this.dataSource.transaction(async (manager) => {
        await manager.update(Asset, asset.id, { status: updateStatusDto.status });
        const log = manager.create(AssetStatusLog, {
          asset: { id: asset.id },
          oldStatus: asset.status,
          newStatus: updateStatusDto.status,
          changedBy: userId ? { id: userId } : undefined,
        } as any);
        await manager.save(AssetStatusLog, log);
      });
    }
    
    return this.findOne(asset.id);
  }

  async getStatusHistory(assetId?: number) {
    const qb = this.assetStatusLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.asset', 'asset')
      .leftJoinAndSelect('log.changedBy', 'changedBy')
      .orderBy('log.createdAt', 'DESC');

    if (assetId) {
      qb.where('asset.id = :assetId', { assetId });
    }

    return qb.getMany();
  }
}
