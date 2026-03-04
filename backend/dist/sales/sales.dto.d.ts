export declare class SaleItemDto {
    productId: number;
    quantity: number;
}
export declare class CreateSaleDto {
    customerName?: string;
    notes?: string;
    items: SaleItemDto[];
}
