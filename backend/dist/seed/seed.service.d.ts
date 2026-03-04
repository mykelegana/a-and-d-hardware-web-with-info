import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
export declare class SeedService implements OnModuleInit {
    private usersService;
    private categoriesRepo;
    private productsRepo;
    private readonly logger;
    constructor(usersService: UsersService, categoriesRepo: Repository<Category>, productsRepo: Repository<Product>);
    onModuleInit(): Promise<void>;
    private seedAdmin;
    private seedCategories;
    private seedProducts;
}
