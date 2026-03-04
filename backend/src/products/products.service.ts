import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
  ) {}

  async findAll(search?: string, categoryId?: number): Promise<Product[]> {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.name', 'ASC');

    if (search) {
      qb.andWhere(
        '(product.name LIKE :search OR product.productCode LIKE :search OR product.sku LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productsRepo.create(data);
    return this.productsRepo.save(product);
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    await this.productsRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepo.delete(id);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.stock <= product.lowStockThreshold')
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  async adjustStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = Number(product.stock) + quantity;
    return this.productsRepo.save(product);
  }
}
