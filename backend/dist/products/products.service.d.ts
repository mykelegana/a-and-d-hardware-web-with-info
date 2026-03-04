import { Repository } from 'typeorm';
import { Product } from './product.entity';
export declare class ProductsService {
    private productsRepo;
    constructor(productsRepo: Repository<Product>);
    findAll(search?: string, categoryId?: number): Promise<Product[]>;
    findOne(id: number): Promise<Product>;
    create(data: Partial<Product>): Promise<Product>;
    update(id: number, data: Partial<Product>): Promise<Product>;
    remove(id: number): Promise<void>;
    getLowStockProducts(): Promise<Product[]>;
    adjustStock(id: number, quantity: number): Promise<Product>;
}
