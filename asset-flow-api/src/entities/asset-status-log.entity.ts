import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Asset } from './asset.entity';
import { AssetStatus } from '@/types/enums';

@Entity({ name: 'asset_status_log' })
export class AssetStatusLog extends CommonEntity {
  @ManyToOne(() => Asset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  @Index()
  asset: Asset;

  @Column({ type: 'enum', enum: AssetStatus, name: 'old_status' })
  oldStatus: AssetStatus;

  @Column({ type: 'enum', enum: AssetStatus, name: 'new_status' })
  newStatus: AssetStatus;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}
