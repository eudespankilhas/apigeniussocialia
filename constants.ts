import { BarChart3, Code, CreditCard, GitBranch, LayoutDashboard, Link, Package, Repeat, Settings, Share2, SlidersHorizontal, Users, DollarSign, Shield, ShieldCheck, ShieldAlert, ShieldX, HelpCircle, AlertTriangle, UserCheck, History } from 'lucide-react';
import type { MenuItem, Notification, TeamMember, DashboardData, PaymentMethod, Affiliate, AffiliateTier, AffiliateStatus, TransactionStatus, SubscriptionStatus, Subscription, Webhook, Integration, ApiKey, Transaction, Product, BillingHistoryEntry, TransactionRiskLevel, PromotionalMaterial, SalesHistoryData, AffiliateTierConfig, PaymentLink, AuditLogEntry, AuditLogAction } from './types';

// Sidebar Menu Items
export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transações', icon: CreditCard, badge: 12 },
  { id: 'subscriptions', label: 'Assinaturas', icon: Repeat },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'payment-links', label: 'Links de Pagamento', icon: Link },
  { id: 'affiliates', label: 'Afiliados', icon: Share2 },
  { id: 'affiliate-portal', label: 'Portal do Afiliado', icon: UserCheck },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'integrations', label: 'Integrações', icon: GitBranch },
  { id: 'webhooks', label: 'Webhooks', icon: SlidersHorizontal },
  { id: 'developers', label: 'Developers', icon: Code },
  { id: 'audit-log', label: 'Log de Auditoria', icon: History },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

// Header User Data
export const USER_DATA: TeamMember = {
  id: 1,
  name: 'Admin User',
  avatarUrl: 'https://picsum.photos/seed/admin-user/40/40',
  email: 'admin@nexuspay.com',
  role: 'Admin',
  lastActivity: 'Online',
};

// Header Notifications Data
export const NOTIFICATIONS_DATA: Notification[] = [
    { id: 1, read: false, color: 'emerald', icon: DollarSign, title: 'Novo Pagamento Recebido!', message: 'Pagamento de R$ 199,90 recebido de João Silva.', timestamp: '2 min atrás' },
    { id: 2, read: false, color: 'blue', icon: Users, title: 'Novo Afiliado Registrado!', message: 'Maria Souza acaba de se tornar sua afiliada.', timestamp: '15 min atrás' },
    { id: 3, read: true, color: 'purple', icon: Code, title: 'Webhook Falhou', message: 'O endpoint /hooks/payment-failed não respondeu.', timestamp: '1 hora atrás' },
    { id: 4, read: true, color: 'red', icon: Shield, title: 'Alerta de Segurança', message: 'Tentativa de login suspeita detectada.', timestamp: '3 horas atrás' },
];

// Dashboard Data
export const DASHBOARD_DATA_BASE: DashboardData = {
  totalSales: 125430.50,
  totalTransactions: 875,
  totalAffiliates: 123,
  recurringRevenue: 23450.00,
  affiliateCommission: 18814.58
};

export const generateDashboardData = (period: string): DashboardData => {
  const multiplier = { today: 0.1, week: 0.7, month: 1, year: 12 };
  const m = multiplier[period as keyof typeof multiplier] || 1;
  return {
    totalSales: DASHBOARD_DATA_BASE.totalSales * m * (Math.random() * 0.2 + 0.9),
    totalTransactions: Math.round(DASHBOARD_DATA_BASE.totalTransactions * m * (Math.random() * 0.2 + 0.9)),
    totalAffiliates: Math.round(DASHBOARD_DATA_BASE.totalAffiliates + (m * 10 * Math.random())),
    recurringRevenue: DASHBOARD_DATA_BASE.recurringRevenue * m * (Math.random() * 0.2 + 0.9),
    affiliateCommission: DASHBOARD_DATA_BASE.affiliateCommission * m * (Math.random() * 0.2 + 0.9),
  };
};

export const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'credit-card', name: 'Cartão de Crédito', icon: '💳', conversions: 92, value: 75230.40, fee: '2.99%' },
    { id: 'pix', name: 'PIX', icon: '⚡', conversions: 98, value: 45120.10, fee: '0.99%' },
    { id: 'boleto', name: 'Boleto Bancário', icon: '📄', conversions: 65, value: 5080.00, fee: 'R$ 3,45' },
];

// Sales Prediction Data
export const SALES_HISTORY_DATA: SalesHistoryData[] = [
    { month: 'Jul/23', sales: 98540.21 },
    { month: 'Ago/23', sales: 110230.45 },
    { month: 'Set/23', sales: 118990.80 },
    { month: 'Out/23', sales: 125430.50 },
];


// Affiliates Data
export const AFFILIATES: Affiliate[] = [
    { id: 1, name: 'Ana Costa', email: 'ana.costa@example.com', avatarUrl: 'https://picsum.photos/seed/ana/40/40', tier: 'Diamond', status: 'active', sales: 254, commission: 5321.50, clicks: 1250, conversionRate: 20.32 },
    { id: 2, name: 'Bruno Lima', email: 'bruno.lima@example.com', avatarUrl: 'https://picsum.photos/seed/bruno/40/40', tier: 'Gold', status: 'active', sales: 182, commission: 3822.00, clicks: 980, conversionRate: 18.57 },
    { id: 3, name: 'Carlos Dias', email: 'carlos.dias@example.com', avatarUrl: 'https://picsum.photos/seed/carlos/40/40', tier: 'Silver', status: 'pending', sales: 89, commission: 1335.75, clicks: 610, conversionRate: 14.59 },
    { id: 4, name: 'Daniela Rocha', email: 'daniela.rocha@example.com', avatarUrl: 'https://picsum.photos/seed/daniela/40/40', tier: 'Bronze', status: 'blocked', sales: 45, commission: 450.00, clicks: 350, conversionRate: 12.85 },
];

export const AFFILIATE_TIER_CONFIGS: AffiliateTierConfig[] = [
    { tier: 'Bronze', salesThreshold: 0, commissionThreshold: 0, benefits: 'Acesso a todos os produtos para afiliação.' },
    { tier: 'Silver', salesThreshold: 50, commissionThreshold: 1000, benefits: 'Comissão base +5%\nSuporte por email' },
    { tier: 'Gold', salesThreshold: 150, commissionThreshold: 3000, benefits: 'Comissão base +10%\nSuporte prioritário via chat\nAcesso antecipado a novos produtos' },
    { tier: 'Diamond', salesThreshold: 300, commissionThreshold: 6000, benefits: 'Comissão base +15%\nGerente de contas dedicado\nMateriais de marketing exclusivos' },
];

export const getTierBadge = (tier: AffiliateTier) => {
    switch (tier) {
        case 'Diamond': return { icon: '💎', color: 'from-cyan-500 to-blue-600' };
        case 'Gold': return { icon: '🏆', color: 'from-yellow-500 to-orange-600' };
        case 'Silver': return { icon: '🥈', color: 'from-slate-400 to-slate-500' };
        case 'Bronze': return { icon: '🥉', color: 'from-orange-600 to-yellow-700' };
        default: return { icon: '🥉', color: 'from-gray-500 to-gray-600' };
    }
};

export const getStatusColor = (status: AffiliateStatus | TransactionStatus | SubscriptionStatus | PaymentLink['status']) => {
    switch (status) {
        case 'active':
        case 'approved':
            return 'bg-emerald-500/20 text-emerald-400';
        case 'pending':
        case 'paused':
            return 'bg-yellow-500/20 text-yellow-400';
        case 'blocked':
        case 'rejected':
        case 'canceled':
            return 'bg-red-500/20 text-red-400';
        default:
            return 'bg-slate-700 text-slate-300';
    }
};

export const getRiskUI = (riskLevel: TransactionRiskLevel) => {
    switch (riskLevel) {
        case 'Baixo':
            return { color: 'bg-emerald-500/20 text-emerald-400', icon: ShieldCheck, label: 'Baixo' };
        case 'Médio':
            return { color: 'bg-yellow-500/20 text-yellow-400', icon: ShieldAlert, label: 'Médio' };
        case 'Alto':
            return { color: 'bg-red-500/20 text-red-400', icon: ShieldX, label: 'Alto' };
        case 'Erro':
            return { color: 'bg-red-500/20 text-red-400', icon: AlertTriangle, label: 'Erro' };
        case 'Pendente':
        default:
            return { color: 'bg-slate-700 text-slate-300', icon: HelpCircle, label: 'Pendente' };
    }
};

// Integrations Data
export const INTEGRATIONS: Integration[] = [
    { id: 'kiwify', name: 'Kiwify', logo: 'https://kiwify.com.br/_next/image?url=%2Fimages%2Flogo-light.png&w=256&q=75', category: 'Pagamentos', description: 'Conecte sua conta Kiwify para sincronizar produtos e vendas de infoprodutos.', connected: false },
    { id: 'slack', name: 'Slack', logo: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', category: 'Suporte', description: 'Receba notificações de vendas e eventos diretamente no seu canal do Slack.', connected: true },
    { id: 'google-analytics', name: 'Google Analytics', logo: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', category: 'Analytics', description: 'Envie eventos de conversão para o Google Analytics e otimize suas campanhas.', connected: false },
    { id: 'rd-station', name: 'RD Station', logo: 'https://cdn.worldvectorlogo.com/logos/rd-station.svg', category: 'Marketing', description: 'Crie leads no RD Station a cada nova venda ou assinatura na NexusPay.', connected: false },
    { id: 'bling', name: 'Bling ERP', logo: 'https://cdn.worldvectorlogo.com/logos/bling-1.svg', category: 'ERP', description: 'Emita notas fiscais e gerencie seu estoque de forma automática.', connected: true },
    { id: 'hotmart', name: 'Hotmart', logo: 'https://cdn.worldvectorlogo.com/logos/hotmart.svg', category: 'Pagamentos', description: 'Importe seus produtos e afiliados da Hotmart para a NexusPay.', connected: false },
    { id: 'stripe', name: 'Stripe', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', category: 'Pagamentos', description: 'Utilize o gateway de pagamento da Stripe para processar cartões de crédito.', connected: false },
];

export const getIntegrationCategoryColor = (category: Integration['category']) => {
    switch (category) {
        case 'Pagamentos': return 'text-emerald-400';
        case 'Marketing': return 'text-orange-400';
        case 'Analytics': return 'text-yellow-400';
        case 'Suporte': return 'text-purple-400';
        case 'ERP': return 'text-blue-400';
        default: return 'text-slate-400';
    }
};


// Developers Data
export const API_KEYS: ApiKey[] = [
    { id: 'pk_live_123abcde', name: 'Chave Pública Padrão', key: 'pk_live_************************cde', createdDate: '01/01/2023', lastUsed: 'Hoje' },
    { id: 'sk_live_456fghij', name: 'Chave Secreta de Produção', key: 'sk_live_************************hij', createdDate: '01/01/2023', lastUsed: 'Ontem' },
];

// Transactions Data
export const TRANSACTIONS: Transaction[] = Array.from({ length: 25 }, (_, i) => {
    const statuses: TransactionStatus[] = ['approved', 'pending', 'rejected'];
    const methods = [
        { icon: '💳', name: 'Cartão de Crédito' },
        { icon: '⚡', name: 'PIX' },
        { icon: '📄', name: 'Boleto' },
    ];
    const countries = ['BR', 'US', 'PT', 'DE', 'JP', 'NG'];
    const status = statuses[i % 3];
    const method = methods[i % 3];
    return {
        id: `txn_${Math.random().toString(36).substring(2, 10)}`,
        customerName: `Cliente ${i + 1}`,
        customerEmail: `cliente${i + 1}@example.com`,
        value: parseFloat((Math.random() * 500 + 20).toFixed(2)),
        date: `2023-10-${28-i} 14:30`,
        status: status,
        methodIcon: method.icon,
        country: countries[i % countries.length],
        isNewCustomer: i % 4 === 0,
        riskLevel: 'Pendente',
        riskReason: '',
    };
});


// Products Data
export const PRODUCTS: Product[] = [
    { id: 1, name: 'Ebook de Marketing Digital', imageUrl: 'https://picsum.photos/seed/ebook/400/300', price: 49.90, description: 'Aprenda as melhores estratégias para alavancar seu negócio online.', sku: 'NXP-MKT-001', stock: 9999, tags: ['Marketing', 'Ebook', 'Digital'] },
    { id: 2, name: 'Curso de Design Gráfico para Iniciantes', imageUrl: 'https://picsum.photos/seed/design/400/300', price: 199.90, description: 'Domine as ferramentas essenciais e crie peças incríveis do zero.', sku: 'NXP-DSG-001', stock: 150, tags: ['Design', 'Curso Online', 'Criativo'] },
    { id: 3, name: 'Mentoria de Carreira em Tecnologia', imageUrl: 'https://picsum.photos/seed/mentoria/400/300', price: 497.00, description: 'Receba orientação personalizada para decolar na sua carreira tech.', sku: 'NXP-MENT-001', stock: 10, tags: ['Carreira', 'Tecnologia', 'Mentoria'] },
    { id: 4, name: 'Pack de Templates para Redes Sociais', imageUrl: 'https://picsum.photos/seed/templates/400/300', price: 97.00, description: 'Economize tempo e crie posts profissionais com nossos templates.', sku: 'NXP-TPL-001', stock: 9999, tags: ['Design', 'Templates', 'Social Media'] },
];

// Settings - Team Members
export const TEAM_MEMBERS: TeamMember[] = [
    { id: 1, name: 'Admin User', email: 'admin@nexuspay.com', avatarUrl: 'https://picsum.photos/seed/admin-user/40/40', role: 'Admin', lastActivity: 'Online' },
    { id: 2, name: 'Dev User', email: 'dev@nexuspay.com', avatarUrl: 'https://picsum.photos/seed/dev-user/40/40', role: 'Developer', lastActivity: '2 horas atrás' },
    { id: 3, name: 'Support User', email: 'support@nexuspay.com', avatarUrl: 'https://picsum.photos/seed/support-user/40/40', role: 'Support', lastActivity: '15 min atrás' },
];

// Settings - Billing History
export const BILLING_HISTORY: BillingHistoryEntry[] = [
    { id: 'inv_12345', date: '01/10/2023', description: 'Plano Pro - Mensalidade', amount: 199.00 },
    { id: 'inv_12344', date: '01/09/2023', description: 'Plano Pro - Mensalidade', amount: 199.00 },
    { id: 'inv_12343', date: '01/08/2023', description: 'Plano Pro - Mensalidade', amount: 199.00 },
];

// Subscriptions Data
export const SUBSCRIPTIONS: Subscription[] = [
    { id: 1, customerName: 'Empresa A', customerEmail: 'contato@empresa-a.com', planName: 'Plano Pro', price: 199.90, cycle: 'monthly', status: 'active', startDate: '2023-01-15' },
    { id: 2, customerName: 'Startup B', customerEmail: 'financeiro@startup-b.dev', planName: 'Plano Plus', price: 99.90, cycle: 'monthly', status: 'active', startDate: '2023-03-20' },
    { id: 3, customerName: 'Cliente C', customerEmail: 'cliente.c@email.com', planName: 'Plano Básico', price: 49.90, cycle: 'yearly', status: 'paused', startDate: '2023-05-10' },
    { id: 4, customerName: 'Agência D', customerEmail: 'pagamentos@agencia-d.com', planName: 'Plano Pro', price: 199.90, cycle: 'monthly', status: 'canceled', startDate: '2023-02-01' },
];

// Webhooks Data
export const WEBHOOKS_DATA: Webhook[] = [
    { id: 1, url: 'https://api.example.com/hooks/payment-success', events: ['payment.approved'], status: 'active' },
    { id: 2, url: 'https://api.example.com/hooks/new-affiliate', events: ['affiliate.created', 'affiliate.updated'], status: 'active' },
    { id: 3, url: 'https://api.example.com/hooks/all', events: ['*'], status: 'inactive' },
    { id: 4, url: 'https://api.example.com/hooks/product-changes', events: ['product.created', 'product.updated', 'product.deleted'], status: 'active' },
];


// Affiliate Portal Data
export const LOGGED_IN_AFFILIATE: Affiliate = AFFILIATES[0]; // Ana Costa

export const AFFILIATE_PERFORMANCE_DATA = [
  { name: 'Jan', comissao: 400 }, { name: 'Fev', comissao: 300 },
  { name: 'Mar', comissao: 500 }, { name: 'Abr', comissao: 450 },
  { name: 'Mai', comissao: 600 }, { name: 'Jun', comissao: 550 },
  { name: 'Jul', comissao: 700 }, { name: 'Ago', comissao: 650 },
  { name: 'Set', comissao: 750 }, { name: 'Out', comissao: 820 },
];

export const PROMOTIONAL_MATERIALS: PromotionalMaterial[] = [
    { 
        id: 1, 
        type: 'banner', 
        title: 'Banner Ebook Marketing Digital', 
        content: 'Banner promocional para o Ebook de Marketing Digital.', 
        imageUrl: 'https://picsum.photos/seed/banner1/800/400' 
    },
    { 
        id: 2, 
        type: 'banner', 
        title: 'Banner Curso Design Gráfico', 
        content: 'Banner para divulgação do Curso de Design para Iniciantes.', 
        imageUrl: 'https://picsum.photos/seed/banner2/800/400'
    },
    {
        id: 3,
        type: 'text',
        title: 'Texto para Email/Redes Sociais',
        content: '🚀 Quer alavancar seu negócio online? O Ebook de Marketing Digital é o guia definitivo que você precisa! Aprenda as melhores estratégias com quem entende do assunto. Clique no meu link e comece a transformar seus resultados hoje mesmo! #marketingdigital #negociosonline #sucesso'
    }
];

// Payment Links Data
export const PAYMENT_LINKS: PaymentLink[] = [
    {
      id: `plnk_abc123`,
      productName: PRODUCTS[0].name,
      productId: PRODUCTS[0].id,
      amount: PRODUCTS[0].price,
      url: 'https://nexuspay.com/pay/plnk_abc123',
      status: 'active',
      createdDate: '2023-10-25',
      sales: 15,
    },
    {
      id: `plnk_def456`,
      productName: PRODUCTS[1].name,
      productId: PRODUCTS[1].id,
      amount: 150.00, // Custom price
      url: 'https://nexuspay.com/pay/plnk_def456',
      status: 'active',
      createdDate: '2023-10-22',
      sales: 8,
    },
    {
      id: `plnk_ghi789`,
      productName: PRODUCTS[2].name,
      productId: PRODUCTS[2].id,
      amount: PRODUCTS[2].price,
      url: 'https://nexuspay.com/pay/plnk_ghi789',
      status: 'inactive',
      createdDate: '2023-09-10',
      sales: 2,
    },
];

// Audit Log Data
export const AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'log_1', user: 'Admin User', avatarUrl: 'https://picsum.photos/seed/admin-user/40/40', action: 'login', details: 'Login bem-sucedido', ipAddress: '189.45.12.10', timestamp: '2023-10-28 14:30:15' },
    { id: 'log_2', user: 'Dev User', avatarUrl: 'https://picsum.photos/seed/dev-user/40/40', action: 'update', details: 'Atualizou a chave de API "Chave Secreta de Produção"', ipAddress: '201.10.5.22', timestamp: '2023-10-28 12:15:45' },
    { id: 'log_3', user: 'Admin User', avatarUrl: 'https://picsum.photos/seed/admin-user/40/40', action: 'create', details: 'Adicionou o produto "Mentoria de Carreira em Tecnologia"', ipAddress: '189.45.12.10', timestamp: '2023-10-27 18:05:02' },
    { id: 'log_4', user: 'Support User', avatarUrl: 'https://picsum.photos/seed/support-user/40/40', action: 'delete', details: 'Removeu o afiliado "Daniela Rocha"', ipAddress: '177.88.99.1', timestamp: '2023-10-27 09:30:00' },
    { id: 'log_5', user: 'Admin User', avatarUrl: 'https://picsum.photos/seed/admin-user/40/40', action: 'security', details: 'Autenticação de Dois Fatores (2FA) foi ativada.', ipAddress: '189.45.12.10', timestamp: '2023-10-26 20:00:11' },
];

export const getAuditActionUI = (action: AuditLogAction) => {
    switch (action) {
        case 'login': return { color: 'bg-emerald-500/20 text-emerald-400', label: 'Login' };
        case 'logout': return { color: 'bg-slate-700 text-slate-300', label: 'Logout' };
        case 'create': return { color: 'bg-blue-500/20 text-blue-400', label: 'Criação' };
        case 'update': return { color: 'bg-yellow-500/20 text-yellow-400', label: 'Atualização' };
        case 'delete': return { color: 'bg-red-500/20 text-red-400', label: 'Exclusão' };
        case 'security': return { color: 'bg-purple-500/20 text-purple-400', label: 'Segurança' };
        default: return { color: 'bg-slate-700 text-slate-300', label: 'Ação' };
    }
};
