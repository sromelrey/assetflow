import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Inventory } from '@/entities/inventory.entity';
import { InventoryLog } from '@/entities/inventory-log.entity';
import { Category } from '@/entities/category.entity';
import { Unit } from '@/entities/unit.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createInventoryDto: CreateInventoryDto, userId?: number) {
    const { categoryId, unitId, ...rest } = createInventoryDto;

    return await this.dataSource.transaction(async (manager) => {
      const inventory = manager.create(Inventory, {
        ...rest,
        ...(categoryId && { category: { id: categoryId } as Category }),
        ...(unitId && { unit: { id: unitId } as Unit }),
      });

      const savedInventory = await manager.save(Inventory, inventory);

      // Log initial stock
      if (savedInventory.quantity > 0) {
        const log = manager.create(InventoryLog, {
          inventory: { id: savedInventory.id } as Inventory,
          quantityChange: savedInventory.quantity,
          previousQuantity: 0,
          newQuantity: savedInventory.quantity,
          reason: 'Initial stock',
          referenceType: 'initial',
          changedBy: userId
            ? ({ id: userId } as Partial<InventoryLog>)
            : undefined,
        });
        await manager.save(InventoryLog, log);
      }

      return manager.findOne(Inventory, {
        where: { id: savedInventory.id },
        relations: ['category', 'unit'],
      });
    });
  }

  findAll() {
    return this.inventoryRepository.find({
      relations: ['category', 'unit'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['category', 'unit'],
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const { categoryId, unitId, ...rest } = updateInventoryDto;

    await this.findOne(id);

    const updateData: Partial<Inventory> = { ...rest };

    if (categoryId !== undefined) {
      updateData.category = categoryId
        ? ({ id: categoryId } as Category)
        : undefined;
    }
    if (unitId !== undefined) {
      updateData.unit = unitId ? ({ id: unitId } as Unit) : undefined;
    }

    await this.inventoryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.inventoryRepository.delete(id);
    return { message: `Inventory #${id} removed successfully` };
  }

  async adjustStock(
    id: number,
    adjustStockDto: AdjustStockDto,
    userId?: number,
  ) {
    const { quantity, reason } = adjustStockDto;

    return await this.dataSource.transaction(async (manager) => {
      const inventory = await manager.findOne(Inventory, {
        where: { id },
        relations: ['category', 'unit'],
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory with ID ${id} not found`);
      }

      const previousQuantity = inventory.quantity;
      const newQuantity = previousQuantity + quantity;

      if (newQuantity < 0) {
        throw new NotFoundException(
          `Insufficient stock. Current: ${previousQuantity}, Requested change: ${quantity}`,
        );
      }

      // Update inventory quantity
      await manager.update(Inventory, id, { quantity: newQuantity });

      // Log the change
      const log = manager.create(InventoryLog, {
        inventory: { id } as Inventory,
        quantityChange: quantity,
        previousQuantity,
        newQuantity,
        reason,
        referenceType: 'manual',
        changedBy: userId
          ? ({ id: userId } as Partial<InventoryLog>)
          : undefined,
      });
      await manager.save(InventoryLog, log);

      this.logger.log(
        `Stock adjusted for inventory ${id}: ${previousQuantity} -> ${newQuantity} (${reason})`,
      );

      return manager.findOne(Inventory, {
        where: { id },
        relations: ['category', 'unit'],
      });
    });
  }

  async getHistory(id: number) {
    await this.findOne(id);
    return this.inventoryLogRepository.find({
      where: { inventory: { id } },
      relations: ['changedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLowStockItems() {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.category', 'category')
      .leftJoinAndSelect('inventory.unit', 'unit')
      .where('inventory.quantity <= inventory.minStockLevel')
      .andWhere('inventory.minStockLevel > 0')
      .orderBy('inventory.quantity', 'ASC')
      .getMany();
  }

  async decrementStock(id: number, userId?: number) {
    return this.adjustStock(
      id,
      { quantity: -1, reason: 'Asset creation' },
      userId,
    );
  }
}
