export type ShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG' | 'XXG' | 'Infantil' | 'A definir';

export type PaymentStatus = 'paid' | 'half' | 'pending';

export interface OrderItem {
  id: string;
  size: ShirtSize;
  quantity: number;
}

export interface Order {
  id: string;
  personName: string;
  items: OrderItem[];
  status: PaymentStatus;
  unitPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  title: string;
  unitPrice: number;
}

export interface SizeSummaryItem {
  size: string;
  count: number;
  percentage: number;
}
