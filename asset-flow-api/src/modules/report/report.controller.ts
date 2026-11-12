import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportService } from './report.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ExportReportDto } from './dto/export-report.dto';
import { Report } from '@/entities/report.entity';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';

@ApiTags('Report')
@ApiBearerAuth('JWT-auth')
@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({
    status: 201,
    description: 'Report generated successfully.',
  })
  @ApiBody({ type: GenerateReportDto })
  generate(
    @Body() generateReportDto: GenerateReportDto,
    @CurrentUser() user: any,
  ) {
    return this.reportService.generateAssetSummaryReport(
      generateReportDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve report history' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reports.',
  })
  findAll(@Query() queryDto: ReportQueryDto) {
    return this.reportService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific report' })
  @ApiResponse({ status: 200, description: 'The report.', type: Report })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  findOne(@Param('id') id: number) {
    return this.reportService.findOne(id);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export a report' })
  @ApiResponse({
    status: 200,
    description: 'Report exported successfully.',
  })
  @ApiBody({ type: ExportReportDto })
  async export(@Body() exportDto: ExportReportDto) {
    return this.reportService.exportReport(exportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report from history' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  remove(@Param('id') id: number) {
    return this.reportService.remove(id);
  }
}
