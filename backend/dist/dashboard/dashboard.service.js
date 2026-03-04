"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("../sales/sales.service");
const products_service_1 = require("../products/products.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/product.entity");
let DashboardService = class DashboardService {
    salesService;
    productsService;
    productsRepo;
    constructor(salesService, productsService, productsRepo) {
        this.salesService = salesService;
        this.productsService = productsService;
        this.productsRepo = productsRepo;
    }
    async getDashboardData() {
        const stats = await this.salesService.getSalesStats();
        const lowStockProducts = await this.productsService.getLowStockProducts();
        const topSellingProducts = await this.salesService.getTopSellingProducts(5);
        const monthlySales = await this.salesService.getMonthlySales(new Date().getFullYear());
        const totalProducts = await this.productsRepo.count();
        const totalStockResult = await this.productsRepo
            .createQueryBuilder('p')
            .select('SUM(p.stock)', 'totalStock')
            .getRawOne();
        const totalStockValue = await this.productsRepo
            .createQueryBuilder('p')
            .select('SUM(p.stock * p.costPrice)', 'value')
            .getRawOne();
        const totalRetailValue = await this.productsRepo
            .createQueryBuilder('p')
            .select('SUM(p.stock * p.sellingPrice)', 'value')
            .getRawOne();
        const soldOutCount = await this.productsRepo
            .createQueryBuilder('p')
            .where('p.stock <= 0')
            .getCount();
        const replenishmentList = await this.productsRepo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.category', 'category')
            .where('p.stock <= p.lowStockThreshold')
            .orderBy('p.stock', 'ASC')
            .addOrderBy('p.name', 'ASC')
            .getMany();
        return {
            totalSales: stats.totalSales,
            totalProfit: stats.totalProfit,
            totalCost: stats.totalCost,
            totalTransactions: stats.totalTransactions,
            totalProducts,
            totalStockAvailable: Number(totalStockResult?.totalStock) || 0,
            totalStockValue: Number(totalStockValue?.value) || 0,
            totalRetailValue: Number(totalRetailValue?.value) || 0,
            soldOutCount,
            lowStockProducts,
            lowStockCount: lowStockProducts.length,
            replenishmentList,
            topSellingProducts,
            monthlySales,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [sales_service_1.SalesService,
        products_service_1.ProductsService,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map