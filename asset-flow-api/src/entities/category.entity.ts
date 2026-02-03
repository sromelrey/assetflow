import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Unit } from './unit.entity';
import { AssetStatus } from '@/types/enums';
import { Asset } from './asset.entity';

@Entity({ name: 'category' })
export class Category extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @OneToMany(() => Asset, (asset) => asset.category)
  assets: Asset[];
}
