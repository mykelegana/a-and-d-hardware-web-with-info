import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category | null> {
    return this.categoriesRepo.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepo.create(data);
    return this.categoriesRepo.save(category);
  }

  async update(id: number, data: Partial<Category>): Promise<Category | null> {
    await this.categoriesRepo.update(id, data);
    return this.categoriesRepo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.categoriesRepo.delete(id);
  }
}
