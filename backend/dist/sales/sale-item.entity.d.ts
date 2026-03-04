import { Sale } from './sale.entity';
import { Product } from '../products/product.entity';
export declare class SaleItem {
    id: number;
    sale: Sale;
    saleId: number;
    product: Product;
    productId: number;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    subtotal: number;
    itemProfit: number;
}
