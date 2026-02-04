import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFloorDto {
  @ApiProperty({ example: '1st Floor', description: 'Floor number or name' })
  @IsString()
  @IsNotEmpty()
  floorNumber: string;

  @ApiProperty({ example: 1, description: 'ID of the building this floor belongs to' })
  @IsInt()
  @IsNotEmpty()
  buildingId: number;
}
