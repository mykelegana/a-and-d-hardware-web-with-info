import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(search?: string, categoryId?: number): Promise<import("./product.entity").Product[]>;
    getLowStock(): Promise<import("./product.entity").Product[]>;
    findOne(id: number): Promise<import("./product.entity").Product>;
    create(dto: CreateProductDto): Promise<import("./product.entity").Product>;
    update(id: number, dto: UpdateProductDto): Promise<import("./product.entity").Product>;
    adjustStock(id: number, quantity: number): Promise<import("./product.entity").Product>;
    remove(id: number): Promise<void>;
}
