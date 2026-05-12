import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    example: 10,
    description: 'Quantity to adjust (positive to add, negative to remove)',
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: 'Stock replenishment',
    description: 'Reason for the stock adjustment',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
