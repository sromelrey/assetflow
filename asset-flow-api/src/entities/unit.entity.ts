import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Asset } from './asset.entity';
import { Department } from './department.entity';

@Entity({ name: 'unit' })
export class Unit extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @ManyToOne(() => Department, (department) => department.id)
  @JoinColumn({ name: 'department_id' })
  @Index()
  departmentId: Department;

  @OneToMany(() => Asset, (asset) => asset.unit)
  assets: Asset[];
}
