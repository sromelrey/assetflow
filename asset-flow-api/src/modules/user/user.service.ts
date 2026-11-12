import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUpgradeDto } from './dto/user-upgrade.dto';
import { User } from '@/entities/user.entity';
import { Employee } from '@/entities/employee.entity';

export function safeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    employeeId: user.employeeId,
    mustChangePassword: user.mustChangePassword,
    canManageAccounts: user.canManageAccounts,
  };
}
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly db: DataSource,
  ) {}
  async create(dto: CreateUserDto) {
    const { name, email, password, firstName, lastName, isActive } = dto;
    return safeUser(
      await this.users.save(
        this.users.create({
          name,
          email: email.trim().toLowerCase(),
          password: await argon2.hash(password),
          firstName,
          lastName,
          isActive,
        }),
      ),
    );
  }
  async findAll() {
    return (await this.users.find()).map(safeUser);
  }
  async findOne(id: number) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return safeUser(user);
  }
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    const { name, email, firstName, lastName, isActive } = dto;
    if (dto.password !== undefined)
      throw new BadRequestException('Use Reset Password to change credentials');
    await this.users.update(id, {
      name,
      email: email?.trim().toLowerCase(),
      firstName,
      lastName,
      isActive,
    });
    return this.findOne(id);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.users.delete(id);
    return { message: 'User removed' };
  }
  async upgradeEmployee(
    employeeId: number,
    _dto: UserUpgradeDto,
    actorId: number,
  ) {
    try {
      return await this.db.transaction(async (manager) => {
        const employee = await manager.findOne(Employee, {
          where: { id: employeeId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!employee) throw new NotFoundException('Employee not found');
        if (
          !employee.email ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email.trim())
        )
          throw new BadRequestException(
            'Employee needs a valid email before upgrading',
          );
        const email = employee.email.trim().toLowerCase();
        const existing = await manager
          .getRepository(User)
          .createQueryBuilder('u')
          .where('u.employeeId=:employeeId OR LOWER(TRIM(u.email))=:email', {
            employeeId,
            email,
          })
          .getOne();
        if (existing)
          throw new ConflictException(
            'An account already exists. Refresh or reconcile the employee account link.',
          );
        const temporaryPassword = randomBytes(18).toString('base64url');
        const user = await manager.save(
          User,
          manager.create(User, {
            name: `${employee.firstName} ${employee.lastName}`,
            email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            employeeId,
            password: await argon2.hash(temporaryPassword),
            isActive: true,
            mustChangePassword: true,
            temporaryPasswordExpiresAt: new Date(Date.now() + 86400000),
          }),
        );
        await manager.query(
          'INSERT INTO account_action_audit(actor_id,target_id,action) VALUES($1,$2,$3)',
          [actorId, user.id, 'upgrade'],
        );
        return { ...safeUser(user), temporaryPassword };
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      )
        throw new ConflictException('Account already exists');
      throw error;
    }
  }
  async resetPassword(id: number, actorId: number) {
    if (id === actorId)
      throw new BadRequestException(
        'Use Change Password for your own account, or ask another administrator to reset it.',
      );
    return this.db.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('User not found');
      const temporaryPassword = randomBytes(18).toString('base64url');
      await manager.update(User, id, {
        password: await argon2.hash(temporaryPassword),
        mustChangePassword: true,
        temporaryPasswordExpiresAt: new Date(Date.now() + 86400000),
        tokenVersion: user.tokenVersion + 1,
      });
      await manager.query('UPDATE users SET refresh_token=NULL WHERE id=$1', [
        id,
      ]);
      await manager.query(
        'INSERT INTO account_action_audit(actor_id,target_id,action) VALUES($1,$2,$3)',
        [actorId, id, 'password_reset'],
      );
      return { id, temporaryPassword };
    });
  }
}
