import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './sales.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales with optional date filter' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.findAll(startDate, endDate);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get sales statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.getSalesStats(startDate, endDate);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  getTopProducts(@Query('limit') limit?: number) {
    return this.salesService.getTopSellingProducts(limit || 10);
  }

  @Get('monthly/:year')
  @ApiOperation({ summary: 'Get monthly sales breakdown for a year' })
  getMonthlySales(@Param('year') year: number) {
    return this.salesService.getMonthlySales(year);
  }

  @Get('report/:year/:month')
  @ApiOperation({ summary: 'Get daily sales report for export' })
  getSalesReport(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.salesService.getSalesReport(year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@Param('id') id: number) {
    return this.salesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sale (deducts stock automatically)' })
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/void a sale (restores stock)' })
  remove(@Param('id') id: number) {
    return this.salesService.remove(id);
  }
}
