import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAssetsDto } from './dto/find-assets.dto';
import { AssetMetricsDto } from './dto/asset-metrics.dto';
import { UpdateAssetStatusDto } from './dto/update-asset-status.dto';
import { Asset } from '@/entities/asset.entity';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';

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

  @Get('metrics')
  @ApiOperation({ summary: 'Retrieve dashboard metrics for assets' })
  @ApiResponse({ status: 200, description: 'Aggregated metrics for the dashboard.', type: AssetMetricsDto })
  getMetrics(@Query('siteId') siteId?: string) {
    return this.assetService.getMetrics(siteId ? Number(siteId) : undefined);
  }

  @Get('status-history')
  @ApiOperation({ summary: 'Retrieve all asset status history' })
  @ApiResponse({ status: 200, description: 'List of all status changes.' })
  getAllStatusHistory() {
    return this.assetService.getStatusHistory();
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
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAssetDto: UpdateAssetDto,
    @CurrentUser() user: any,
  ) {
    return this.assetService.update(id, updateAssetDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.remove(id);
  }
  @Get('find-by-no/:assetNo')
  @ApiOperation({ summary: 'Retrieve a specific asset by asset number' })
  @ApiResponse({ status: 200, description: 'The asset.', type: Asset })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  findByAssetNo(@Param('assetNo') assetNo: string) {
    return this.assetService.findByAssetNo(assetNo);
  }

  @Patch('status-by-no/:assetNo')
  @ApiOperation({ summary: 'Update an asset status by asset number' })
  @ApiResponse({ status: 200, description: 'The updated asset.', type: Asset })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  @ApiBody({ type: UpdateAssetStatusDto })
  updateStatusByAssetNo(
    @Param('assetNo') assetNo: string, 
    @Body() updateStatusDto: UpdateAssetStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.assetService.updateStatusByAssetNo(assetNo, updateStatusDto, user.id);
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Retrieve status history for a specific asset' })
  @ApiResponse({ status: 200, description: 'List of status changes.' })
  getStatusHistory(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.getStatusHistory(id);
  }
}
