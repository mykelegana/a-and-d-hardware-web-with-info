import { Injectable } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';

@Injectable()
export class DashboardService {
  constructor(
    private salesService: SalesService,
    private productsService: ProductsService,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
  ) {}

  async getDashboardData() {
    const stats = await this.salesService.getSalesStats();
    const lowStockProducts = await this.productsService.getLowStockProducts();
    const topSellingProducts =
      await this.salesService.getTopSellingProducts(5);
    const monthlySales = await this.salesService.getMonthlySales(
      new Date().getFullYear(),
    );

    const totalProducts = await this.productsRepo.count();

    // Total stock available (sum of all current stock)
    const totalStockResult = await this.productsRepo
      .createQueryBuilder('p')
      .select('SUM(p.stock)', 'totalStock')
      .getRawOne();

    // Total inventory value (stock * costPrice)
    const totalStockValue = await this.productsRepo
      .createQueryBuilder('p')
      .select('SUM(p.stock * p.costPrice)', 'value')
      .getRawOne();

    // Total inventory retail value (stock * sellingPrice)
    const totalRetailValue = await this.productsRepo
      .createQueryBuilder('p')
      .select('SUM(p.stock * p.sellingPrice)', 'value')
      .getRawOne();

    // Sold out products count
    const soldOutCount = await this.productsRepo
      .createQueryBuilder('p')
      .where('p.stock <= 0')
      .getCount();

    // Replenishment priority list (sold out + low stock, ordered by stock ASC)
    const replenishmentList = await this.productsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .where('p.stock <= p.lowStockThreshold')
      .orderBy('p.stock', 'ASC')
      .addOrderBy('p.name', 'ASC')
      .getMany();

    return {
      totalSales: stats.totalSales,
      totalProfit: stats.totalProfit,
      totalCost: stats.totalCost,
      totalTransactions: stats.totalTransactions,
      totalProducts,
      totalStockAvailable: Number(totalStockResult?.totalStock) || 0,
      totalStockValue: Number(totalStockValue?.value) || 0,
      totalRetailValue: Number(totalRetailValue?.value) || 0,
      soldOutCount,
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
      replenishmentList,
      topSellingProducts,
      monthlySales,
    };
  }
}
