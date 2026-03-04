import { SalesService } from '../sales/sales.service';
import { ProductsService } from '../products/products.service';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
export declare class DashboardService {
    private salesService;
    private productsService;
    private productsRepo;
    constructor(salesService: SalesService, productsService: ProductsService, productsRepo: Repository<Product>);
    getDashboardData(): Promise<{
        totalSales: number;
        totalProfit: number;
        totalCost: number;
        totalTransactions: number;
        totalProducts: number;
        totalStockAvailable: number;
        totalStockValue: number;
        totalRetailValue: number;
        soldOutCount: number;
        lowStockProducts: Product[];
        lowStockCount: number;
        replenishmentList: Product[];
        topSellingProducts: any[];
        monthlySales: {
            month: number;
            totalSales: number;
            totalProfit: number;
            transactions: number;
        }[];
    }>;
}
