import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Inventory } from './inventory.entity';
import { User } from './user.entity';

@Entity({ name: 'inventory_log' })
export class InventoryLog extends CommonEntity {
  @ManyToOne(() => Inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  @Index()
  inventory: Inventory;

  @Column({ type: 'int', name: 'quantity_change' })
  quantityChange: number;

  @Column({ type: 'int', name: 'previous_quantity' })
  previousQuantity: number;

  @Column({ type: 'int', name: 'new_quantity' })
  newQuantity: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'reference_type',
  })
  referenceType?: string;

  @Column({ type: 'int', nullable: true, name: 'reference_id' })
  referenceId?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedBy: User;
}
