import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("./category.entity").Category[]>;
    findOne(id: number): Promise<import("./category.entity").Category | null>;
    create(dto: CreateCategoryDto): Promise<import("./category.entity").Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("./category.entity").Category | null>;
    remove(id: number): Promise<void>;
}
