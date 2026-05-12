import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { Asset } from './asset.entity';
import { InventoryLog } from './inventory-log.entity';

@Entity({ name: 'inventory' })
export class Inventory extends CommonEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'unit_price',
  })
  unitPrice?: number;

  @Column({ type: 'int', default: 0, name: 'min_stock_level' })
  minStockLevel: number;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  @Index()
  category: Category;

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: 'unit_id' })
  @Index()
  unit: Unit;

  @OneToMany(() => Asset, (asset) => asset.inventory)
  assets: Asset[];

  @OneToMany(() => InventoryLog, (log) => log.inventory)
  logs: InventoryLog[];
}
