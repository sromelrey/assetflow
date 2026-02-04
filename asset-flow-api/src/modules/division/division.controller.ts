import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { Division } from '@/entities/division.entity';

@ApiTags('Division')
@Controller('division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new division' })
  @ApiResponse({ status: 201, description: 'Division created successfully.', type: Division })
  @ApiBody({ type: CreateDivisionDto })
  create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionService.create(createDivisionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all divisions' })
  @ApiResponse({ status: 200, description: 'List of divisions.', type: [Division] })
  findAll() {
    return this.divisionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific division' })
  @ApiResponse({ status: 200, description: 'The division.', type: Division })
  @ApiResponse({ status: 404, description: 'Division not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.divisionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a division' })
  @ApiResponse({ status: 200, description: 'The updated division.', type: Division })
  @ApiResponse({ status: 404, description: 'Division not found.' })
  @ApiBody({ type: UpdateDivisionDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDivisionDto: UpdateDivisionDto) {
    return this.divisionService.update(id, updateDivisionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a division' })
  @ApiResponse({ status: 200, description: 'Division deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Division not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.divisionService.remove(id);
  }
}
