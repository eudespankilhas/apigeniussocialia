import type { LucideIcon } from 'lucide-react';

export type MenuId =
  | 'dashboard'
  | 'transactions'
  | 'subscriptions'
  | 'products'
  | 'payment-links'
  | 'affiliates'
  | 'affiliate-portal'
  | 'reports'
  | 'integrations'
  | 'webhooks'
  | 'developers'
  | 'settings'
  | 'audit-log';

export interface MenuItem {
  id: MenuId;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface Notification {
  id: number;
  read: boolean;
  color: 'emerald' | 'blue' | 'purple' | 'red';
  icon: LucideIcon;
  title: string;
  message: string;
  timestamp: string;
}

export type TeamMemberRole = 'Admin' | 'Developer' | 'Support';

export interface TeamMember {
  id: number;
  name: string;
  avatarUrl: string;
  email: string;

  role: TeamMemberRole;
  lastActivity: string;
}

export interface DashboardData {
    totalSales: number;
    totalTransactions: number;
    totalAffiliates: number;
    recurringRevenue: number;
    affiliateCommission: number;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    conversions: number;
    value: number;
    fee: string;
}

export type AffiliateTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type AffiliateStatus = 'active' | 'pending' | 'blocked';

export interface Affiliate {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
    tier: AffiliateTier;
    status: AffiliateStatus;
    sales: number;
    commission: number;
    clicks: number;
    conversionRate: number;
}

export interface AffiliateTierConfig {
  tier: AffiliateTier;
  salesThreshold: number;
  commissionThreshold: number;
  benefits: string;
}

export interface Integration {
    id: string;
    name: string;
    logo: string;
    category: 'Pagamentos' | 'Marketing' | 'Analytics' | 'Suporte' | 'ERP';
    description: string;
    connected: boolean;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdDate: string;
    lastUsed: string;
}

export type TransactionStatus = 'approved' | 'pending' | 'rejected';
export type TransactionRiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Pendente' | 'Erro';


export interface Transaction {
    id: string;
    customerName: string;
    customerEmail: string;
    value: number;
    date: string;
    status: TransactionStatus;
    methodIcon: string;
    country: string;
    isNewCustomer: boolean;
    riskLevel: TransactionRiskLevel;
    riskReason: string;
}

export interface Product {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    description: string;
    sku: string;
    stock: number;
    tags: string[];
}

export interface BillingHistoryEntry {
    id: string;
    date: string;
    description: string;
    amount: number;
}

export type SubscriptionStatus = 'active' | 'paused' | 'canceled';
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly';

export interface Subscription {
  id: number;
  customerName: string;
  customerEmail: string;
  planName: string;
  price: number;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
}

export interface Webhook {
    id: number;
    url: string;
    events: string[];
    status: 'active' | 'inactive';
}

export interface PromotionalMaterial {
    id: number;
    type: 'banner' | 'text';
    title: string;
    content: string;
    imageUrl?: string;
}

export interface SalesHistoryData {
    month: string;
    sales: number;
}

export interface PaymentLink {
    id: string;
    productName: string;
    productId: number;
    amount: number;
    url: string;
    status: 'active' | 'inactive';
    createdDate: string;
    sales: number;
}

export type AuditLogAction = 'login' | 'logout' | 'update' | 'create' | 'delete' | 'security';

export interface AuditLogEntry {
  id: string;
  user: string;
  avatarUrl: string;
  action: AuditLogAction;
  details: string;
  ipAddress: string;
  timestamp: string;
}
