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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sale_entity_1 = require("./sale.entity");
const sale_item_entity_1 = require("./sale-item.entity");
const products_service_1 = require("../products/products.service");
let SalesService = class SalesService {
    salesRepo;
    saleItemsRepo;
    productsService;
    constructor(salesRepo, saleItemsRepo, productsService) {
        this.salesRepo = salesRepo;
        this.saleItemsRepo = saleItemsRepo;
        this.productsService = productsService;
    }
    async findAll(startDate, endDate) {
        const qb = this.salesRepo
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .orderBy('sale.saleDate', 'DESC');
        if (startDate && endDate) {
            qb.where('sale.saleDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate: endDate + ' 23:59:59',
            });
        }
        return qb.getMany();
    }
    async findOne(id) {
        return this.salesRepo.findOne({
            where: { id },
            relations: ['items', 'items.product'],
        });
    }
    async create(data) {
        let totalAmount = 0;
        let totalCost = 0;
        const saleItems = [];
        for (const item of data.items) {
            const product = await this.productsService.findOne(item.productId);
            const currentStock = Number(product.stock);
            const unitSellingPrice = Number(product.sellingPrice);
            const unitCostPrice = Number(product.costPrice);
            if (currentStock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}. Available: ${currentStock}`);
            }
            const subtotal = unitSellingPrice * item.quantity;
            const costTotal = unitCostPrice * item.quantity;
            const itemProfit = subtotal - costTotal;
            saleItems.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: unitSellingPrice,
                costPrice: unitCostPrice,
                subtotal,
                itemProfit,
            });
            totalAmount += subtotal;
            totalCost += costTotal;
            await this.productsService.adjustStock(item.productId, -item.quantity);
        }
        const maxResult = await this.salesRepo
            .createQueryBuilder('sale')
            .select('MAX(sale.saleNumber)', 'maxNum')
            .getRawOne();
        const nextSaleNumber = (Number(maxResult?.maxNum) || 0) + 1;
        const sale = this.salesRepo.create({
            saleNumber: nextSaleNumber,
            customerName: data.customerName,
            notes: data.notes,
            totalAmount,
            totalCost,
            profit: totalAmount - totalCost,
            items: saleItems,
        });
        return this.salesRepo.save(sale);
    }
    async remove(id) {
        const sale = await this.findOne(id);
        if (sale) {
            for (const item of sale.items) {
                await this.productsService.adjustStock(item.productId, item.quantity);
            }
            await this.salesRepo.delete(id);
        }
    }
    async getSalesStats(startDate, endDate) {
        const qb = this.salesRepo.createQueryBuilder('sale');
        if (startDate && endDate) {
            qb.where('sale.saleDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate: endDate + ' 23:59:59',
            });
        }
        const result = await qb
            .select('SUM(sale.totalAmount)', 'totalSales')
            .addSelect('SUM(sale.profit)', 'totalProfit')
            .addSelect('SUM(sale.totalCost)', 'totalCost')
            .addSelect('COUNT(sale.id)', 'totalTransactions')
            .getRawOne();
        return {
            totalSales: Number(result.totalSales) || 0,
            totalProfit: Number(result.totalProfit) || 0,
            totalCost: Number(result.totalCost) || 0,
            totalTransactions: Number(result.totalTransactions) || 0,
        };
    }
    async getTopSellingProducts(limit = 10) {
        return this.saleItemsRepo
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.product', 'product')
            .select('item.productId', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('product.productCode', 'productCode')
            .addSelect('product.unit', 'unit')
            .addSelect('SUM(item.quantity)', 'totalQuantity')
            .addSelect('SUM(item.subtotal)', 'totalRevenue')
            .addSelect('SUM(item.itemProfit)', 'totalProfit')
            .groupBy('item.productId')
            .addGroupBy('product.name')
            .addGroupBy('product.productCode')
            .addGroupBy('product.unit')
            .orderBy('totalQuantity', 'DESC')
            .limit(limit)
            .getRawMany();
    }
    async getSalesReport(year, month) {
        const items = await this.saleItemsRepo
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.product', 'product')
            .leftJoin('item.sale', 'sale')
            .addSelect('sale.saleDate')
            .where('YEAR(sale.saleDate) = :year', { year })
            .andWhere('MONTH(sale.saleDate) = :month', { month })
            .getMany();
        const productMap = {};
        for (const item of items) {
            const pid = item.productId;
            if (!productMap[pid]) {
                productMap[pid] = {
                    productCode: item.product?.productCode || '',
                    name: item.product?.name || '',
                    unit: item.product?.unit || '',
                    costPrice: Number(item.product?.costPrice || 0),
                    sellingPrice: Number(item.product?.sellingPrice || 0),
                    beginningStock: Number(item.product?.beginningStock || 0),
                    stock: Number(item.product?.stock || 0),
                    dailySales: {},
                    totalQty: 0,
                    totalSales: 0,
                    totalProfit: 0,
                };
            }
            const day = new Date(item.sale?.saleDate || item['sale_saleDate']).getDate();
            const qty = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);
            const costPrice = Number(item.costPrice);
            productMap[pid].dailySales[day] = (productMap[pid].dailySales[day] || 0) + qty;
            productMap[pid].totalQty += qty;
            productMap[pid].totalSales += unitPrice * qty;
            productMap[pid].totalProfit += (unitPrice - costPrice) * qty;
        }
        return {
            year,
            month,
            daysInMonth: new Date(year, month, 0).getDate(),
            products: Object.values(productMap).sort((a, b) => a.name.localeCompare(b.name)),
        };
    }
    async getMonthlySales(year) {
        const results = await this.salesRepo
            .createQueryBuilder('sale')
            .select('MONTH(sale.saleDate)', 'month')
            .addSelect('SUM(sale.totalAmount)', 'totalSales')
            .addSelect('SUM(sale.profit)', 'totalProfit')
            .addSelect('COUNT(sale.id)', 'transactions')
            .where('YEAR(sale.saleDate) = :year', { year })
            .groupBy('MONTH(sale.saleDate)')
            .orderBy('month', 'ASC')
            .getRawMany();
        return results.map((r) => ({
            month: Number(r.month),
            totalSales: Number(r.totalSales) || 0,
            totalProfit: Number(r.totalProfit) || 0,
            transactions: Number(r.transactions) || 0,
        }));
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sale_entity_1.Sale)),
    __param(1, (0, typeorm_1.InjectRepository)(sale_item_entity_1.SaleItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService])
], SalesService);
//# sourceMappingURL=sales.service.js.map