import { Column, Entity, Index } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('users')
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
export class User extends CommonEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 500, name: 'refresh_token', nullable: true })
  refreshToken?: string;
}