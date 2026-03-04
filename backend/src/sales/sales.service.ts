import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepo: Repository<SaleItem>,
    private productsService: ProductsService,
  ) {}

  async findAll(startDate?: string, endDate?: string): Promise<Sale[]> {
    const qb = this.salesRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('sale.saleDate', 'DESC');

    if (startDate && endDate) {
      qb.where('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: endDate + ' 23:59:59',
      });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Sale | null> {
    return this.salesRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
  }

  async create(data: {
    customerName?: string;
    notes?: string;
    items: { productId: number; quantity: number }[];
  }): Promise<Sale> {
    let totalAmount = 0;
    let totalCost = 0;
    const saleItems: Partial<SaleItem>[] = [];

    for (const item of data.items) {
      const product = await this.productsService.findOne(item.productId);
      const currentStock = Number(product.stock);
      const unitSellingPrice = Number(product.sellingPrice);
      const unitCostPrice = Number(product.costPrice);

      if (currentStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${currentStock}`,
        );
      }

      const subtotal = unitSellingPrice * item.quantity;
      const costTotal = unitCostPrice * item.quantity;
      const itemProfit = subtotal - costTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitSellingPrice,
        costPrice: unitCostPrice,
        subtotal,
        itemProfit,
      });

      totalAmount += subtotal;
      totalCost += costTotal;

      // Deduct stock
      await this.productsService.adjustStock(item.productId, -item.quantity);
    }

    // Compute next sale number (resets if all sales deleted)
    const maxResult = await this.salesRepo
      .createQueryBuilder('sale')
      .select('MAX(sale.saleNumber)', 'maxNum')
      .getRawOne();
    const nextSaleNumber = (Number(maxResult?.maxNum) || 0) + 1;

    const sale = this.salesRepo.create({
      saleNumber: nextSaleNumber,
      customerName: data.customerName,
      notes: data.notes,
      totalAmount,
      totalCost,
      profit: totalAmount - totalCost,
      items: saleItems as SaleItem[],
    });

    return this.salesRepo.save(sale);
  }

  async remove(id: number): Promise<void> {
    const sale = await this.findOne(id);
    if (sale) {
      // Restore stock for each item
      for (const item of sale.items) {
        await this.productsService.adjustStock(item.productId, item.quantity);
      }
      await this.salesRepo.delete(id);
    }
  }

  async getSalesStats(startDate?: string, endDate?: string) {
    const qb = this.salesRepo.createQueryBuilder('sale');

    if (startDate && endDate) {
      qb.where('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: endDate + ' 23:59:59',
      });
    }

    const result = await qb
      .select('SUM(sale.totalAmount)', 'totalSales')
      .addSelect('SUM(sale.profit)', 'totalProfit')
      .addSelect('SUM(sale.totalCost)', 'totalCost')
      .addSelect('COUNT(sale.id)', 'totalTransactions')
      .getRawOne();

    return {
      totalSales: Number(result.totalSales) || 0,
      totalProfit: Number(result.totalProfit) || 0,
      totalCost: Number(result.totalCost) || 0,
      totalTransactions: Number(result.totalTransactions) || 0,
    };
  }

  async getTopSellingProducts(limit = 10) {
    return this.saleItemsRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .select('item.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('product.productCode', 'productCode')
      .addSelect('product.unit', 'unit')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .addSelect('SUM(item.itemProfit)', 'totalProfit')
      .groupBy('item.productId')
      .addGroupBy('product.name')
      .addGroupBy('product.productCode')
      .addGroupBy('product.unit')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getSalesReport(year: number, month: number) {
    // Get all sale items for the given month with product info and sale date
    const items = await this.saleItemsRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoin('item.sale', 'sale')
      .addSelect('sale.saleDate')
      .where('YEAR(sale.saleDate) = :year', { year })
      .andWhere('MONTH(sale.saleDate) = :month', { month })
      .getMany();

    // Build daily breakdown: { productId -> { day -> totalQty } }
    const productMap: Record<number, {
      productCode: string;
      name: string;
      unit: string;
      costPrice: number;
      sellingPrice: number;
      beginningStock: number;
      stock: number;
      dailySales: Record<number, number>;
      totalQty: number;
      totalSales: number;
      totalProfit: number;
    }> = {};

    for (const item of items) {
      const pid = item.productId;
      if (!productMap[pid]) {
        productMap[pid] = {
          productCode: item.product?.productCode || '',
          name: item.product?.name || '',
          unit: item.product?.unit || '',
          costPrice: Number(item.product?.costPrice || 0),
          sellingPrice: Number(item.product?.sellingPrice || 0),
          beginningStock: Number(item.product?.beginningStock || 0),
          stock: Number(item.product?.stock || 0),
          dailySales: {},
          totalQty: 0,
          totalSales: 0,
          totalProfit: 0,
        };
      }

      const day = new Date(item.sale?.saleDate || item['sale_saleDate']).getDate();
      const qty = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const costPrice = Number(item.costPrice);

      productMap[pid].dailySales[day] = (productMap[pid].dailySales[day] || 0) + qty;
      productMap[pid].totalQty += qty;
      productMap[pid].totalSales += unitPrice * qty;
      productMap[pid].totalProfit += (unitPrice - costPrice) * qty;
    }

    return {
      year,
      month,
      daysInMonth: new Date(year, month, 0).getDate(),
      products: Object.values(productMap).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  async getMonthlySales(year: number) {
    const results = await this.salesRepo
      .createQueryBuilder('sale')
      .select('MONTH(sale.saleDate)', 'month')
      .addSelect('SUM(sale.totalAmount)', 'totalSales')
      .addSelect('SUM(sale.profit)', 'totalProfit')
      .addSelect('COUNT(sale.id)', 'transactions')
      .where('YEAR(sale.saleDate) = :year', { year })
      .groupBy('MONTH(sale.saleDate)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      month: Number(r.month),
      totalSales: Number(r.totalSales) || 0,
      totalProfit: Number(r.totalProfit) || 0,
      transactions: Number(r.transactions) || 0,
    }));
  }
}
