import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAssetsDto } from './dto/find-assets.dto';
import { Asset } from '@/entities/asset.entity';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';

@ApiTags('Asset')
@ApiBearerAuth('JWT-auth')
@Controller('asset')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully.', type: Asset })
  @ApiBody({ type: CreateAssetDto })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.create(createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all assets' })
  @ApiResponse({ status: 200, description: 'List of assets.', type: [Asset] })
  findAll(@Query() query: FindAssetsDto) {
    return this.assetService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific asset' })
  @ApiResponse({ status: 200, description: 'The asset.', type: Asset })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'The updated asset.', type: Asset })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  @ApiBody({ type: UpdateAssetDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.remove(id);
  }
}
