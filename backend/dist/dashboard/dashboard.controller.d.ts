import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(): Promise<{
        totalSales: number;
        totalProfit: number;
        totalCost: number;
        totalTransactions: number;
        totalProducts: number;
        totalStockAvailable: number;
        totalStockValue: number;
        totalRetailValue: number;
        soldOutCount: number;
        lowStockProducts: import("../products/product.entity").Product[];
        lowStockCount: number;
        replenishmentList: import("../products/product.entity").Product[];
        topSellingProducts: any[];
        monthlySales: {
            month: number;
            totalSales: number;
            totalProfit: number;
            transactions: number;
        }[];
    }>;
}
