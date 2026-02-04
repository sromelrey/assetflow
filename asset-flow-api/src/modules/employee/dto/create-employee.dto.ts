import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John', description: 'First name of the employee' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Middle name of the employee' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Smith', description: 'Last name of the employee' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'john.smith@example.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Software Engineer', description: 'Job position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'active', description: 'Status of the employee' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2023-01-15', description: 'Date hired' })
  @IsOptional()
  @IsDateString()
  dateHired?: Date;

  @ApiPropertyOptional({ example: 'Full-Time', description: 'Type of employment' })
  @IsOptional()
  @IsString()
  employmentType?: string;
}
