import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from '@/entities/unit.entity';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  create(createUnitDto: CreateUnitDto) {
    const { departmentId, ...rest } = createUnitDto;
    const unit = this.unitRepository.create({
      ...rest,
      departmentId: { id: departmentId },
    } as any);
    return this.unitRepository.save(unit);
  }

  findAll() {
    return this.unitRepository.find({
      relations: ['departmentId'],
    });
  }

  async findOne(id: number) {
    const unit = await this.unitRepository.findOne({
      where: { id },
      relations: ['departmentId'],
    });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    const { departmentId, ...rest } = updateUnitDto;
    const updateData: any = { ...rest };

    if (departmentId) {
      updateData.departmentId = { id: departmentId };
    }

    const result = await this.unitRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.unitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return { message: `Unit #${id} removed successfully` };
  }
}
