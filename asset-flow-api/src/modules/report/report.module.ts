import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report } from '@/entities/report.entity';
import { Asset } from '@/entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Asset])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
