import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../products/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column()
  saleId: number;

  @ManyToOne(() => Product, (product) => product.saleItems, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number; // selling price at time of sale

  @Column('decimal', { precision: 10, scale: 2 })
  costPrice: number; // cost price at time of sale

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number; // quantity * unitPrice

  @Column('decimal', { precision: 12, scale: 2 })
  itemProfit: number; // (unitPrice - costPrice) * quantity
}
