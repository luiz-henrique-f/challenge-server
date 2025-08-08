import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OrderStatus {
  PENDENTE = 'pendente',
  PROCESSANDO = 'processando',
  ENVIADO = 'enviado',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}

interface OrderItem {
  productId: string;
  nome?: string;
  quantidade: number;
  preco: number;
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { name: 'items' })
  items: OrderItem[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDENTE,
  })
  @Index()
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
