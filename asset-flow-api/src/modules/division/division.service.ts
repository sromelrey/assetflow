import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { Division } from '@/entities/division.entity';

@Injectable()
export class DivisionService {
  constructor(
    @InjectRepository(Division)
    private readonly divisionRepository: Repository<Division>,
  ) {}

  create(createDivisionDto: CreateDivisionDto) {
    const { floorId, ...rest } = createDivisionDto;
    const division = this.divisionRepository.create({
      ...rest,
      floor: { id: floorId },
    } as any);
    return this.divisionRepository.save(division);
  }

  findAll(floorId?: number) {
    const whereClause = floorId ? { floor: { id: floorId } } : {};
    return this.divisionRepository.find({
      where: whereClause,
      relations: ['floor'],
    });
  }

  async findOne(id: number) {
    const division = await this.divisionRepository.findOne({
      where: { id },
      relations: ['floor'],
    });
    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }
    return division;
  }

  async update(id: number, updateDivisionDto: UpdateDivisionDto) {
    const { floorId, ...rest } = updateDivisionDto;
    const updateData: any = { ...rest };

    if (floorId) {
      updateData.floor = { id: floorId };
    }

    const result = await this.divisionRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.divisionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }
    return { message: `Division #${id} removed successfully` };
  }
}
