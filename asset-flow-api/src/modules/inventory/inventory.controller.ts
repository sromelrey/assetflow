import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Inventory } from '@/entities/inventory.entity';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully.',
    type: Inventory,
  })
  @ApiBody({ type: CreateInventoryDto })
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @Query('userId') userId?: string,
  ) {
    return this.inventoryService.create(
      createInventoryDto,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all inventory items' })
  @ApiResponse({
    status: 200,
    description: 'List of inventory items.',
    type: [Inventory],
  })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Retrieve low stock items' })
  @ApiResponse({
    status: 200,
    description: 'List of items below minimum stock level.',
    type: [Inventory],
  })
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific inventory item' })
  @ApiResponse({
    status: 200,
    description: 'The inventory item.',
    type: Inventory,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Retrieve inventory item history' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item history.',
    type: [Object],
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found.' })
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.getHistory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiResponse({
    status: 200,
    description: 'The updated inventory item.',
    type: Inventory,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found.' })
  @ApiBody({ type: UpdateInventoryDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Post(':id/adjust-stock')
  @ApiOperation({ summary: 'Adjust inventory stock quantity' })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully.',
    type: Inventory,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found.' })
  @ApiBody({ type: AdjustStockDto })
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustStockDto: AdjustStockDto,
    @Query('userId') userId?: string,
  ) {
    return this.inventoryService.adjustStock(
      id,
      adjustStockDto,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
