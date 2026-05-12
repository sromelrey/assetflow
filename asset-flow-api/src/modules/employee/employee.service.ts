import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@/entities/employee.entity';

/**
 * Service for managing employee records.
 */
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Creates a new employee record.
   *
   * @param createEmployeeDto - The employee data
   * @returns The created Employee entity
   */
  create(createEmployeeDto: CreateEmployeeDto) {
    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  /**
   * Retrieves all employee records.
   *
   * @returns List of Employee entities
   */
  findAll() {
    return this.employeeRepository.find();
  }

  /**
   * Retrieves a specific employee record by ID.
   *
   * @param id - The ID of the employee
   * @returns The Employee entity
   * @throws {NotFoundException} If employee not found
   */
  async findOne(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  /**
   * Updates an existing employee record.
   *
   * @param id - The ID of the employee to update
   * @param updateEmployeeDto - The updated employee data
   * @returns The updated Employee entity
   * @throws {NotFoundException} If employee not found
   */
  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    const updated = await this.employeeRepository.preload({
      id,
      ...updateEmployeeDto,
    });

    if (!updated) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.employeeRepository.save(updated);
  }

  /**
   * Removes an employee record (soft-delete recommended but using delete for now to match repository pattern if delete is used elsewhere).
   *
   * @param id - The ID of the employee to remove
   * @returns A success message
   * @throws {NotFoundException} If employee not found
   */
  async remove(id: number) {
    const result = await this.employeeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return { message: `Employee #${id} removed successfully` };
  }
}
