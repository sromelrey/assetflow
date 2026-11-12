import { Entity, Column, OneToMany, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Building } from './building.entity';

@Entity({ name: 'site' })
export class Site extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  @OneToMany(() => Building, (building) => building.site)
  buildings: Building[];
}
