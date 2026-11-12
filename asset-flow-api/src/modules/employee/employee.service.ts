import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private readonly db: DataSource,
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
  async findAll() {
    const employees = await this.employeeRepository.find();
    const users = await this.db.query(
      'SELECT id, employee_id, is_active, email FROM users WHERE deleted_at IS NULL',
    );
    return employees.map((employee) => {
      const user = users.find((u) => u.employee_id === employee.id);
      const unresolved =
        !user &&
        employee.email &&
        users.some(
          (u) =>
            u.email?.trim().toLowerCase() ===
            employee.email?.trim().toLowerCase(),
        );
      return {
        ...employee,
        userAccount: user ? { id: user.id, isActive: user.is_active } : null,
        accountLinkNeedsReview: !!unresolved,
      };
    });
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
    const links = await this.db.query(
      'SELECT 1 FROM users WHERE employee_id=$1',
      [id],
    );
    if (links.length)
      throw new ConflictException(
        'This employee has a linked account. Remove the account before deleting the employee.',
      );
    const result = await this.employeeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return { message: `Employee #${id} removed successfully` };
  }
}
