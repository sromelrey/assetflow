import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Unit 1', description: 'Name of the unit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'ID of the department this unit belongs to' })
  @IsInt()
  @IsNotEmpty()
  departmentId: number;
}
