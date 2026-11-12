import { Column, Entity, Index } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('users')
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
export class User extends CommonEntity {
  @Column({ name: 'employee_id', type: 'int', nullable: true })
  employeeId?: number;
  @Column({ name: 'must_change_password', default: false })
  mustChangePassword: boolean;
  @Column({
    name: 'temporary_password_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  temporaryPasswordExpiresAt?: Date | null;
  @Column({ name: 'token_version', default: 0 }) tokenVersion: number;
  @Column({ name: 'can_manage_accounts', default: false })
  canManageAccounts: boolean;

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

  @Column({
    type: 'varchar',
    length: 500,
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken?: string;
}
