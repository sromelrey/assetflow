import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from './common.entity';
import { User } from './user.entity';

export enum ReportType {
  SUMMARY = 'SUMMARY',
  DEPLOYED = 'DEPLOYED',
  ON_HAND = 'ON_HAND',
  PER_DEPARTMENT = 'PER_DEPARTMENT',
  PER_LOCATION = 'PER_LOCATION',
  LIFECYCLE = 'LIFECYCLE',
  REPAIR_MAINTENANCE = 'REPAIR_MAINTENANCE',
  DISPOSAL = 'DISPOSAL',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({ name: 'report' })
export class Report extends CommonEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  reportName: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    name: 'report_type',
  })
  @Index()
  reportType: ReportType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by' })
  @Index()
  generatedBy: User;

  @Column({ type: 'jsonb', nullable: true, name: 'filters_json' })
  filtersJson?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'report_data_json' })
  reportDataJson?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'export_file_paths' })
  exportFilePaths?: Record<string, string>;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.GENERATING,
    name: 'status',
  })
  @Index()
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;
}
