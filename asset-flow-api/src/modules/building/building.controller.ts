import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from '@/entities/building.entity';

@ApiTags('Building')
@Controller('building')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new building' })
  @ApiResponse({ status: 201, description: 'Building created successfully.', type: Building })
  @ApiBody({ type: CreateBuildingDto })
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingService.create(createBuildingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all buildings' })
  @ApiResponse({ status: 200, description: 'List of buildings.', type: [Building] })
  findAll() {
    return this.buildingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific building' })
  @ApiResponse({ status: 200, description: 'The building.', type: Building })
  @ApiResponse({ status: 404, description: 'Building not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buildingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a building' })
  @ApiResponse({ status: 200, description: 'The updated building.', type: Building })
  @ApiResponse({ status: 404, description: 'Building not found.' })
  @ApiBody({ type: UpdateBuildingDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBuildingDto: UpdateBuildingDto) {
    return this.buildingService.update(id, updateBuildingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a building' })
  @ApiResponse({ status: 200, description: 'Building deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Building not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildingService.remove(id);
  }
}
