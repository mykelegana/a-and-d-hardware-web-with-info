import { Category } from '../categories/category.entity';
import { SaleItem } from '../sales/sale-item.entity';
export declare class Product {
    id: number;
    productCode: string;
    name: string;
    sku: string;
    description: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    beginningStock: number;
    stock: number;
    lowStockThreshold: number;
    category: Category;
    categoryId: number;
    saleItems: SaleItem[];
    createdAt: Date;
    updatedAt: Date;
}
