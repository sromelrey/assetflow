import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { Floor } from '@/entities/floor.entity';

@Injectable()
export class FloorService {
  constructor(
    @InjectRepository(Floor)
    private readonly floorRepository: Repository<Floor>,
  ) {}

  create(createFloorDto: CreateFloorDto) {
    const { buildingId, ...rest } = createFloorDto;
    const floor = this.floorRepository.create({
      ...rest,
      building: { id: buildingId },
    } as any);
    return this.floorRepository.save(floor);
  }

  findAll(buildingId?: number) {
    const whereClause = buildingId ? { building: { id: buildingId } } : {};
    return this.floorRepository.find({
      where: whereClause,
      relations: ['building'],
    });
  }

  async findOne(id: number) {
    const floor = await this.floorRepository.findOne({
      where: { id },
      relations: ['building'],
    });
    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }
    return floor;
  }

  async update(id: number, updateFloorDto: UpdateFloorDto) {
    const { buildingId, ...rest } = updateFloorDto;
    const updateData: any = { ...rest };

    if (buildingId) {
      updateData.building = { id: buildingId };
    }

    const result = await this.floorRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.floorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }
    return { message: `Floor #${id} removed successfully` };
  }
}
