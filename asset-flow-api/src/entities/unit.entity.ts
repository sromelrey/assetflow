import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Division } from './division.entity';
import { Asset } from './asset.entity';

@Entity({ name: 'unit' })
export class Unit extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  @Index()
  status: string;

  @ManyToOne(() => Division, (division) => division.units)
  @JoinColumn({ name: 'division_id' })
  @Index()
  division: Division;

  @OneToMany(() => Asset, (asset) => asset.unit)
  assets: Asset[];
}
