import {
  Controller,
  UseGuards,
  Req,
  Header,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUpgradeDto } from './dto/user-upgrade.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { AccountManagementGuard } from '@/guards/account-management.guard';
import { User } from '@/entities/user.entity';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard, AccountManagementGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('upgrade/:employeeId')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Upgrade an employee to a user' })
  @ApiResponse({
    status: 201,
    description: 'Employee upgraded to user successfully.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  upgrade(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() upgradeDto: UserUpgradeDto,
    @Req() req: any,
  ) {
    return this.userService.upgradeEmployee(
      employeeId,
      upgradeDto,
      req.user.id,
    );
  }

  @Post(':id/reset-password')
  @Header('Cache-Control', 'no-store')
  resetPassword(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.userService.resetPassword(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: User,
  })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of users.', type: [User] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific user' })
  @ApiResponse({ status: 200, description: 'The user.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The updated user.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: UpdateUserDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
