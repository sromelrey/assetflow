import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Floor } from './floor.entity';
import { Unit } from './unit.entity';

@Entity({ name: 'division' })
export class Division extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  @Index()
  status: string;

  @ManyToOne(() => Floor, (floor) => floor.divisions)
  @JoinColumn({ name: 'floor_id' })
  @Index()
  floor: Floor;

  @OneToMany(() => Unit, (unit) => unit.division)
  units: Unit[];
}
