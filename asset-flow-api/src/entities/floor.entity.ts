import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Building } from './building.entity';
import { Division } from './division.entity';

@Entity({ name: 'floor' })
export class Floor extends CommonEntity {
  @Column({ type: 'varchar', length: 50 })
  @Index()
  floorNumber: string;

  @ManyToOne(() => Building, (building) => building.floors)
  @JoinColumn({ name: 'building_id' })
  @Index()
  building: Building;

  @OneToMany(() => Division, (division) => division.floor)
  divisions: Division[];
}
