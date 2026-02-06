import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FloorService } from './floor.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { Floor } from '@/entities/floor.entity';

@ApiTags('Floor')
@Controller('floor')
export class FloorController {
  constructor(private readonly floorService: FloorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new floor' })
  @ApiResponse({ status: 201, description: 'Floor created successfully.', type: Floor })
  @ApiBody({ type: CreateFloorDto })
  create(@Body() createFloorDto: CreateFloorDto) {
    return this.floorService.create(createFloorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all floors' })
  @ApiResponse({ status: 200, description: 'List of floors.', type: [Floor] })
  @ApiQuery({ name: 'buildingId', required: false, type: Number, description: 'Filter by building ID' })
  findAll(@Query('buildingId') buildingId?: string) {
    return this.floorService.findAll(buildingId ? parseInt(buildingId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific floor' })
  @ApiResponse({ status: 200, description: 'The floor.', type: Floor })
  @ApiResponse({ status: 404, description: 'Floor not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.floorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a floor' })
  @ApiResponse({ status: 200, description: 'The updated floor.', type: Floor })
  @ApiResponse({ status: 404, description: 'Floor not found.' })
  @ApiBody({ type: UpdateFloorDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFloorDto: UpdateFloorDto) {
    return this.floorService.update(id, updateFloorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a floor' })
  @ApiResponse({ status: 200, description: 'Floor deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Floor not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.floorService.remove(id);
  }
}
