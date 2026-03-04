import { SaleItem } from './sale-item.entity';
export declare class Sale {
    id: number;
    saleNumber: number;
    customerName: string;
    totalAmount: number;
    totalCost: number;
    profit: number;
    notes: string;
    items: SaleItem[];
    saleDate: Date;
}
