import { Repository } from 'typeorm';
import { Category } from './category.entity';
export declare class CategoriesService {
    private categoriesRepo;
    constructor(categoriesRepo: Repository<Category>);
    findAll(): Promise<Category[]>;
    findOne(id: number): Promise<Category | null>;
    create(data: Partial<Category>): Promise<Category>;
    update(id: number, data: Partial<Category>): Promise<Category | null>;
    remove(id: number): Promise<void>;
}
