/**
 * Elisa Tapiocas - Internal Management System Types
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
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  deliveryType: DeliveryType;
  address?: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  observations?: string;
  createdAt: string;
  isClosed?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
}

export interface MoneyEntry {
  id: string;
  description: string;
  value: number;
  paymentType: PaymentMethod;
  date: string;
  orderId?: string; // Optional reference to an order
  isClosed?: boolean;
}

export interface MoneyExit {
  id: string;
  description: string;
  value: number;
  category: ExitCategory;
  date: string;
  isClosed?: boolean;
}

export interface CashClosing {
  id: string;
  date: string;
  totalEntries: number;
  totalExits: number;
  profit: number;
  orderCount: number;
  completedOrders: number;
  cancelledOrders: number;
  createdAt: string;
  entries: MoneyEntry[];
  exits: MoneyExit[];
  orders: Order[];
}
