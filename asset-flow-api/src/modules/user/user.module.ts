import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '@/entities/user.entity';
import { Employee } from '@/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
