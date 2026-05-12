import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUpgradeDto } from './dto/user-upgrade.dto';
import { User } from '@/entities/user.entity';
import { Employee } from '@/entities/employee.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User #${id} removed successfully` };
  }

  async upgradeEmployee(employeeId: number, upgradeDto: UserUpgradeDto) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: employee.email },
    });
    if (existingUser) {
      throw new Error(`User with email ${employee.email} already exists`);
    }

    const temporaryPassword = 'Password123!';
    const hashedPassword = await argon2.hash(temporaryPassword);

    const user = this.userRepository.create({
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email as string,
      password: hashedPassword,
      firstName: employee.firstName,
      lastName: employee.lastName,
      isActive: true,
    });

    return this.userRepository.save(user);
  }
}
