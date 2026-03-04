import { SalesService } from './sales.service';
import { CreateSaleDto } from './sales.dto';
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    findAll(startDate?: string, endDate?: string): Promise<import("./sale.entity").Sale[]>;
    getStats(startDate?: string, endDate?: string): Promise<{
        totalSales: number;
        totalProfit: number;
        totalCost: number;
        totalTransactions: number;
    }>;
    getTopProducts(limit?: number): Promise<any[]>;
    getMonthlySales(year: number): Promise<{
        month: number;
        totalSales: number;
        totalProfit: number;
        transactions: number;
    }[]>;
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
    findOne(id: number): Promise<import("./sale.entity").Sale | null>;
    create(dto: CreateSaleDto): Promise<import("./sale.entity").Sale>;
    remove(id: number): Promise<void>;
}
