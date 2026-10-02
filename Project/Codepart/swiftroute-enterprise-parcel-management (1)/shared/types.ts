export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export type ParcelStatus = 
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type ParcelType = 'standard' | 'express' | 'fragile' | 'heavy' | 'document';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash_on_delivery' | 'wallet';

export interface Parcel {
  id: string;
  tracking_number: string;
  sender_id: string;
  sender_name?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  pickup_address: string;
  delivery_address: string;
  weight_kg: number;
  dimensions?: string; // e.g. "30x20x15 cm"
  parcel_type: ParcelType;
  status: ParcelStatus;
  assigned_agent_id?: string | null;
  assigned_agent_name?: string | null;
  shipping_cost: number;
  payment_status: PaymentStatus;
  estimated_delivery: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingCheckpoint {
  id: string;
  parcel_id: string;
  tracking_number: string;
  status: ParcelStatus;
  location: string;
  description: string;
  updated_by?: string;
  timestamp: string;
}

export interface Payment {
  id: string;
  parcel_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface DeliveryProof {
  id: string;
  parcel_id: string;
  agent_id: string;
  recipient_name: string;
  signature_url?: string;
  photo_url?: string;
  notes?: string;
  delivered_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: UserRole;
  action: string;
  entity_type: 'parcel' | 'user' | 'payment' | 'system';
  entity_id?: string;
  details: string;
  created_at: string;
}

export interface SystemSettings {
  company_name: string;
  support_email: string;
  support_phone: string;
  currency: string;
  base_rate_per_kg: number;
  express_surcharge: number;
  fragile_surcharge: number;
  tax_rate_percent: number;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  maintenance_mode: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalParcels: number;
  pendingDeliveries: number;
  inTransit: number;
  deliveredToday: number;
  totalRevenue: number;
  activeAgents: number;
  totalCustomers: number;
  deliverySuccessRate: number;
}
