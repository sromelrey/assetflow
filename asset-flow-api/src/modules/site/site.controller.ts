import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from '@/entities/site.entity';

@ApiTags('Site')
@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new site' })
  @ApiResponse({ status: 201, description: 'Site created successfully.', type: Site })
  @ApiBody({ type: CreateSiteDto })
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(createSiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all sites' })
  @ApiResponse({ status: 200, description: 'List of sites.', type: [Site] })
  findAll() {
    return this.siteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific site' })
  @ApiResponse({ status: 200, description: 'The site.', type: Site })
  @ApiResponse({ status: 404, description: 'Site not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a site' })
  @ApiResponse({ status: 200, description: 'The updated site.', type: Site })
  @ApiResponse({ status: 404, description: 'Site not found.' })
  @ApiBody({ type: UpdateSiteDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSiteDto: UpdateSiteDto) {
    return this.siteService.update(id, updateSiteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a site' })
  @ApiResponse({ status: 200, description: 'Site deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Site not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.remove(id);
  }
}
