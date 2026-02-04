import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Human Resources', description: 'Name of the department' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'ID of the division this department belongs to' })
  @IsInt()
  @IsNotEmpty()
  divisionId: number;
}
