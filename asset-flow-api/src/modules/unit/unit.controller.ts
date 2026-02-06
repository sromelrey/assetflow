import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from '@/entities/unit.entity';

@ApiTags('Unit')
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully.', type: Unit })
  @ApiBody({ type: CreateUnitDto })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all units' })
  @ApiResponse({ status: 200, description: 'List of units.', type: [Unit] })
  @ApiQuery({ name: 'departmentId', required: false, type: Number, description: 'Filter by department ID' })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.unitService.findAll(departmentId ? parseInt(departmentId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific unit' })
  @ApiResponse({ status: 200, description: 'The unit.', type: Unit })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({ status: 200, description: 'The updated unit.', type: Unit })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  @ApiBody({ type: UpdateUnitDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.remove(id);
  }
}
