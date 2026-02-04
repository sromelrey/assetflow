import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from '@/entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    const { divisionId, ...rest } = createDepartmentDto;
    const department = this.departmentRepository.create({
      ...rest,
      divisionId: { id: divisionId }, // Uses number
    } as any);
    return this.departmentRepository.save(department);
  }

  findAll() {
    return this.departmentRepository.find({
      relations: ['divisionId'],
    });
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['divisionId'],
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const { divisionId, ...rest } = updateDepartmentDto;
    const updateData: any = { ...rest };

    if (divisionId) {
      updateData.divisionId = { id: divisionId };
    }

    const result = await this.departmentRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.departmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return { message: `Department #${id} removed successfully` };
  }
}
