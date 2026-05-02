/**
 * Eliza Tapiocas - Internal Management System Types
 */

export enum OrderStatus {
  PENDING = 'PENDENTE',
  PREPARING = 'EM PREPARO',
  COMPLETED = 'CONCLUÍDO',
  CANCELLED = 'CANCELADO',
}

export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'DINHEIRO',
  CARD = 'CARTÃO',
}

export enum DeliveryType {
  PICKUP = 'RETIRADA',
  DELIVERY = 'ENTREGA',
}

export enum ProductCategory {
  SAVORY = 'Salgada',
  CONDENSED_MILK = 'Com leite condensado',
  SWEET_FILLED = 'Doce recheada',
}

export enum ExitCategory {
  INGREDIENTS = 'Ingredientes',
  PACKAGING = 'Embalagens',
  DELIVERY = 'Entrega',
  GAS = 'Gás',
  OTHERS = 'Outros',
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  address?: string;
  payment_method: string;
  status: string;
  notes?: string;
  total: number;
  cash_received?: number;
  change_amount?: number;
  created_at: string;
  items?: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface MoneyEntry {
  id: string;
  description: string;
  value: number;
  payment_type: string;
  order_id?: string;
  created_at: string;
}

export interface MoneyExit {
  id: string;
  description: string;
  value: number;
  category: string;
  created_at: string;
}

export interface CashClosing {
  id: string;
  closing_date: string;
  closed_at: string;
  total_orders: number;
  completed_orders: number;
  canceled_orders: number;
  entries_total: number;
  exits_total: number;
  estimated_profit: number;
  snapshot: any;
}
