import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export data to PDF or Excel' })
  @ApiQuery({ name: 'entity', required: true, description: 'Entity name (e.g., User, Blog)' })
  @ApiQuery({ name: 'format', required: true, enum: ['pdf', 'excel'] })
  @ApiQuery({ name: 'filters', required: false, description: 'JSON string of filters' })
  async export(
    @Query('entity') entity: string,
    @Query('format') format: 'pdf' | 'excel',
    @Query('filters') filtersStr: string,
    @Res() res: Response,
  ) {
    if (!entity || !format) {
      throw new BadRequestException('Entity and format are required');
    }

    const filters = filtersStr ? JSON.parse(filtersStr) : {};

    try {
      if (format === 'pdf') {
        const buffer = await this.reportsService.generatePdf(entity, filters);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${entity}-report.pdf"`,
          'Content-Length': buffer.length,
        });
        res.send(buffer);
      } else if (format === 'excel') {
        const buffer = await this.reportsService.generateExcel(entity, filters);
        res.set({
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${entity}-report.xlsx"`,
          'Content-Length': buffer.length,
        });
        res.send(buffer);
      } else {
        throw new BadRequestException('Invalid format. Use "pdf" or "excel"');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
