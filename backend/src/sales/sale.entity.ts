import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  saleNumber: number;

  @Column({ nullable: true })
  customerName: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount: number; // Total selling price

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalCost: number; // Total cost price

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  profit: number; // totalAmount - totalCost

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, (item) => item.sale, {
    cascade: true,
    eager: true,
  })
  items: SaleItem[];

  @CreateDateColumn()
  saleDate: Date;
}
