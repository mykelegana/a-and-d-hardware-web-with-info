import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SalesModule } from '../sales/sales.module';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Sale } from '../sales/sale.entity';
import { SaleItem } from '../sales/sale-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Sale, SaleItem]),
    SalesModule,
    ProductsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
