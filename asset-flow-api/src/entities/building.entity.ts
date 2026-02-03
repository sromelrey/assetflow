import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { Site } from './site.entity';
import { Floor } from './floor.entity';

@Entity({ name: 'building' })
export class Building extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @ManyToOne(() => Site, (site) => site.buildings)
  @JoinColumn({ name: 'site_id' })
  @Index()
  site: Site;

  @OneToMany(() => Floor, (floor) => floor.building)
  floors: Floor[];
}
