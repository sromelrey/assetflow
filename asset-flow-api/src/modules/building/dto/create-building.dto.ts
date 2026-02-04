import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Main Building', description: 'Name of the building' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'ID of the site this building belongs to' })
  @IsInt()
  @IsNotEmpty()
  siteId: number;
}
