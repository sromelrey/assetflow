import { CommonEntity } from './common.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Asset } from './asset.entity';

@Entity({ name: 'asset_details' })
export class AssetDetails extends CommonEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  brand: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  model: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  computerName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  operatingSystem: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  processor: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  memory: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  storage: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  poNumber: string;

  @Column({ type: 'date', nullable: true })
  @Index()
  manufacturingDate: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  pmDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  imei: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToOne(() => Asset, (asset) => asset.assetDetails)
  @JoinColumn({ name: 'asset_id' })
  @Index()
  assetId: Asset;
}
