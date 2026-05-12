import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base entity class that provides common functionality for all entities.
 * - Automatic timestamps (createdAt, updatedAt, deletedAt)
 * - Audit fields (createdBy, updatedBy, deletedBy)
 */
export abstract class CommonEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  @Index()
  createdBy?: number;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy?: number;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  deletedAt: Date;
}
