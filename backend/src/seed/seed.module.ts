import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Category, Product]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
