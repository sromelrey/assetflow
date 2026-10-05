import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportType, ReportStatus } from '@/entities/report.entity';
import { Asset } from '@/entities/asset.entity';
import { AssetStatus } from '@/types/enums';
import { GenerateReportDto, DateType } from './dto/generate-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ExportReportDto, ExportFormat } from './dto/export-report.dto';

/**
 * Manages report generation, storage, and export operations.
 */
@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  /**
   * Generates an asset summary report based on the provided filters.
   *
   * @param generateReportDto - Report generation parameters
   * @param userId - ID of the user generating the report
   * @returns The generated report data
   */
  async generateAssetSummaryReport(
    generateReportDto: GenerateReportDto,
    userId: number,
  ) {
    const { siteIds, categoryIds, dateRange } = generateReportDto;

    // Build query with hierarchy joins
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.unit', 'unit')
      .leftJoinAndSelect('unit.departmentId', 'department')
      .leftJoinAndSelect('department.divisionId', 'division')
      .leftJoinAndSelect('division.floor', 'floor')
      .leftJoinAndSelect('floor.building', 'building')
      .leftJoinAndSelect('building.site', 'site')
      .leftJoinAndSelect('asset.category', 'category');

    // Apply filters
    if (siteIds && siteIds.length > 0) {
      queryBuilder.andWhere('site.id IN (:...siteIds)', { siteIds });
    }

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere('category.id IN (:...categoryIds)', {
        categoryIds,
      });
    }

    // Apply date range filter based on date type
    if (dateRange) {
      const { startDate, endDate, dateType } = dateRange;
      const start = new Date(startDate);
      const end = new Date(endDate);

      switch (dateType) {
        case DateType.CREATION:
          queryBuilder.andWhere('asset.createdAt BETWEEN :start AND :end', {
            start,
            end,
          });
          break;
        case DateType.DEPLOYMENT:
          // For deployment date, we need to check the status log
          // This is a simplified version - in production, you'd need a more complex query
          queryBuilder.andWhere('asset.status = :status', {
            status: AssetStatus.DEPLOYED,
          });
          break;
        case DateType.PURCHASE:
          queryBuilder.andWhere('asset.purchaseDate BETWEEN :start AND :end', {
            start,
            end,
          });
          break;
      }
    }

    const assets = await queryBuilder.getMany();

    // Aggregate data by site and category
    const siteData: Record<number, any> = {};

    for (const asset of assets) {
      const siteId =
        asset.unit?.departmentId?.divisionId?.floor?.building?.site?.id || 0;
      const categoryId = asset.category?.id || 0;
      const categoryName = asset.category?.name || 'Uncategorized';
      const siteName =
        asset.unit?.departmentId?.divisionId?.floor?.building?.site?.name ||
        'Unknown Site';

      // Initialize site if not exists
      if (!siteData[siteId]) {
        siteData[siteId] = {
          siteId,
          siteName,
          categories: {},
        };
      }

      // Initialize category for this site
      if (!siteData[siteId].categories[categoryId]) {
        siteData[siteId].categories[categoryId] = {
          categoryId,
          categoryName,
          total: 0,
          deployed: 0,
          onHand: 0,
        };
      }

      // Update counts
      siteData[siteId].categories[categoryId].total++;
      if (asset.status === AssetStatus.DEPLOYED) {
        siteData[siteId].categories[categoryId].deployed++;
      } else {
        siteData[siteId].categories[categoryId].onHand++;
      }
    }

    const reportData = {
      title: 'Asset Summary Report',
      generatedAt: new Date(),
      filters: generateReportDto,
      data: siteData,
    };

    if (generateReportDto.saveToHistory) {
      const report = this.reportRepository.create({
        reportName: `Asset Summary - ${new Date().toISOString().split('T')[0]}`,
        reportType: ReportType.SUMMARY,
        generatedBy: { id: userId } as any, // TODO: Fix type when User entity is properly imported
        filtersJson: generateReportDto,
        reportDataJson: reportData,
        status: ReportStatus.COMPLETED,
      });
      await this.reportRepository.save(report);
      return { ...reportData, reportId: report.id };
    }

    return reportData;
  }

  /**
   * Retrieves a specific report by ID.
   *
   * @param id - Report ID
   * @returns The report entity
   * @throws {NotFoundException} If report not found
   */
  async findOne(id: number) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['generatedBy'],
    });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Retrieves a paginated list of reports.
   *
   * @param queryDto - Query parameters for filtering and pagination
   * @returns Paginated list of reports
   */
  async findAll(queryDto: ReportQueryDto) {
    const { page = 1, limit = 10, reportType, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.generatedBy', 'generatedBy')
      .orderBy('report.createdAt', 'DESC');

    if (reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType });
    }

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    const [reports, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Exports a report to the specified format.
   *
   * @param exportDto - Export parameters
   * @returns File buffer or path
   */
  async exportReport(exportDto: ExportReportDto) {
    const report = await this.findOne(exportDto.reportId);

    // TODO: Implement export logic
    switch (exportDto.format) {
      case ExportFormat.PDF:
        return this.exportToPdf(report);
      case ExportFormat.EXCEL:
        return this.exportToExcel(report);
      case ExportFormat.CSV:
        return this.exportToCsv(report);
      default:
        throw new NotFoundException('Invalid export format');
    }
  }

  /**
   * Deletes a report from history.
   *
   * @param id - Report ID
   * @throws {NotFoundException} If report not found
   */
  async remove(id: number) {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }

  /**
   * Exports report to PDF format.
   */
  private exportToPdf(report: Report) {
    // TODO: Implement PDF generation using pdfkit or jspdf
    return { message: 'PDF export not yet implemented', reportId: report.id };
  }

  /**
   * Exports report to Excel format.
   */
  private exportToExcel(report: Report) {
    // TODO: Implement Excel generation using exceljs
    return { message: 'Excel export not yet implemented', reportId: report.id };
  }

  /**
   * Exports report to CSV format.
   */
  private exportToCsv(report: Report) {
    const reportData = report.reportDataJson;
    if (!reportData || !reportData.data) {
      throw new NotFoundException('No report data available for export');
    }

    const csvRows: string[] = [];
    csvRows.push('Site,Category,Total,Deployed,On-Hand');

    for (const siteId in reportData.data) {
      const site = reportData.data[siteId];
      for (const categoryId in site.categories) {
        const category = site.categories[categoryId];
        csvRows.push(
          `"${site.siteName}","${category.categoryName}",${category.total},${category.deployed},${category.onHand}`,
        );
      }
    }

    const csvContent = csvRows.join('\n');

    return {
      contentType: 'text/csv',
      filename: `${report.reportName}.csv`,
      content: csvContent,
    };
  }
}
