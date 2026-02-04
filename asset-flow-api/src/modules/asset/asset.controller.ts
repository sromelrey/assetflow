import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from '@/entities/asset.entity';

@ApiTags('Asset')
@Controller('asset')
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
  findAll() {
    return this.assetService.findAll();
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
