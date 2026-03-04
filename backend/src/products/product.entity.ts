import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { SaleItem } from '../sales/sale-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  productCode: string; // e.g., CON-CMT-001, ELC-WIR-001

  @Column()
  name: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  unit: string; // e.g., "piece", "kg", "meter", "bag", "roll", "box"

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costPrice: number; // Purchase/cost price

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sellingPrice: number; // Selling price

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  beginningStock: number; // Starting inventory count

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  stock: number; // Current stock quantity (Ending Stock / Balance Qty)

  @Column({ default: 5 })
  lowStockThreshold: number; // Alert when stock falls below this

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.product)
  saleItems: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
