import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { ProductsService } from '../products/products.service';
export declare class SalesService {
    private salesRepo;
    private saleItemsRepo;
    private productsService;
    constructor(salesRepo: Repository<Sale>, saleItemsRepo: Repository<SaleItem>, productsService: ProductsService);
    findAll(startDate?: string, endDate?: string): Promise<Sale[]>;
    findOne(id: number): Promise<Sale | null>;
    create(data: {
        customerName?: string;
        notes?: string;
        items: {
            productId: number;
            quantity: number;
        }[];
    }): Promise<Sale>;
    remove(id: number): Promise<void>;
    getSalesStats(startDate?: string, endDate?: string): Promise<{
        totalSales: number;
        totalProfit: number;
        totalCost: number;
        totalTransactions: number;
    }>;
    getTopSellingProducts(limit?: number): Promise<any[]>;
    getSalesReport(year: number, month: number): Promise<{
        year: number;
        month: number;
        daysInMonth: number;
        products: {
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
        }[];
    }>;
    getMonthlySales(year: number): Promise<{
        month: number;
        totalSales: number;
        totalProfit: number;
        transactions: number;
    }[]>;
}
