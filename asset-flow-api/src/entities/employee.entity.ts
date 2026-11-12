import { Entity, Column, Index } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity({ name: 'employee' })
export class Employee extends CommonEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index()
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  middleName?: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  @Index({ unique: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  position?: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  @Index()
  status: string;

  @Column({ type: 'date', nullable: true })
  dateHired?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employmentType?: string; // Full-Time, Part-Time, Contract
}
