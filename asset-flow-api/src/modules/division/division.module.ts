import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { Division } from '@/entities/division.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Division])],
  controllers: [DivisionController],
  providers: [DivisionService],
})
export class DivisionModule {}
