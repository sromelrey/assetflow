import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Unit } from './unit.entity';
import { AssetStatus } from '@/types/enums';
import { Category } from './category.entity';
import { Employee } from './employee.entity';

@Entity({ name: 'asset' })
export class Asset extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  @Index({ unique: true })
  serialNumber?: string;

  @Column({type:'varchar', length: 100, unique: true})
  @Index()
  assetNo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  assetType?: string;

  @Column({ type: 'date', nullable: true })
  @Index()
  purchaseDate?: Date;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE })
  @Index()
  status: AssetStatus;

  @ManyToOne(() => Unit, (unit) => unit.assets)
  @JoinColumn({ name: 'unit_id' })
  @Index()
  unit: Unit;

  @ManyToOne(() => Category, (category) => category.assets)
  @JoinColumn({ name: 'category_id' })
  @Index()
  category: Category;

    // Link to Employee who created the asset
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  createdByEmployee: Employee;

  // Link to Employee who last updated the asset
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'updated_by' })
  updatedByEmployee: Employee;
}
