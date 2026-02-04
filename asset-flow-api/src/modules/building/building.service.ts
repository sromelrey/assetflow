import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from '@/entities/building.entity';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  create(createBuildingDto: CreateBuildingDto) {
    const { siteId, ...rest } = createBuildingDto;
    const building = this.buildingRepository.create({
      ...rest,
      site: { id: siteId },
    } as any);
    return this.buildingRepository.save(building);
  }

  findAll() {
    return this.buildingRepository.find({
      relations: ['site'],
    });
  }

  async findOne(id: number) {
    const building = await this.buildingRepository.findOne({
      where: { id },
      relations: ['site'],
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return building;
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto) {
    const { siteId, ...rest } = updateBuildingDto;
    const updateData: any = { ...rest };
    
    if (siteId) {
      updateData.site = { id: siteId };
    }

    const result = await this.buildingRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.buildingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return { message: `Building #${id} removed successfully` };
  }
}
