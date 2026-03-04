export declare class CreateProductDto {
    productCode: string;
    name: string;
    sku?: string;
    description?: string;
    unit?: string;
    costPrice: number;
    sellingPrice: number;
    beginningStock?: number;
    stock: number;
    lowStockThreshold?: number;
    categoryId?: number;
}
export declare class UpdateProductDto {
    productCode?: string;
    name?: string;
    sku?: string;
    description?: string;
    unit?: string;
    costPrice?: number;
    sellingPrice?: number;
    beginningStock?: number;
    stock?: number;
    lowStockThreshold?: number;
    categoryId?: number;
}
