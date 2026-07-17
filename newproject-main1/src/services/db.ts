export interface Product {
  id: string
  name: string
  category: 'Electronics' | 'Apparel' | 'Groceries' | 'Medical' | 'Food'
  stock: number
  minStock: number
  price: number
  cost: number
  expiryDate?: string
  salesCount: number
  overstock: boolean
  sku: string
  image: string
  rating?: number
}

export interface Sale {
  id: string
  _id?: string
  timestamp: string
  productName: string
  quantity: number
  total: number
  customerName: string
  phone?: string
  shippingStatus?: 'placed' | 'confirmed' | 'packed' | 'ready_for_dispatch' | 'shipped' | 'reached_hub' | 'out_for_delivery' | 'delivered' | 'cancelled'
  rating?: number
  review?: string
  products?: { productName: string; quantity: number; price: number }[]
}

export interface Employee {
  id: string
  name: string
  role: 'Manager' | 'Cashier' | 'Admin' | 'Sales Associate'
  salary: number
  attendance: 'Present' | 'Late' | 'Absent' | 'Leave'
  productivityScore: number
  tasksAssigned: string[]
  shifts: string[] // e.g., ["Mon 9-5", "Tue 9-5"]
  avatar?: string
  phone?: string
  email?: string
  joiningDate?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  segment: 'Loyal' | 'Active' | 'Inactive' | 'Churn Risk'
  clv: number // Customer Lifetime Value
  lastPurchase: string
  feedbackScore: number // 1-5
  feedbackText: string
}

export interface MarketingCampaign {
  id: string
  platform: string
  title: string
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed'
  date: string
  clicks: number
  conversion: number
  copy: string
  hashtags: string
  imagePrompt?: string
}

export interface CustomerRequest {
  id: string
  customerName: string
  requestText: string
  productRequested: string
  timestamp: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  replyText?: string
}

export interface ChatMessage {
  id: string
  sender: 'customer' | 'owner'
  text: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'voice'
  mediaUrl?: string
  seen: boolean
}

export interface AppDBState {
  products: Product[]
  sales: Sale[]
  employees: Employee[]
  customers: Customer[]
  campaigns: MarketingCampaign[]
  automations: Record<string, boolean>
  customerRequests: CustomerRequest[]
  chatMessages: ChatMessage[]
  logs: string[]
}

// Curated map of product keywords to specific verified Unsplash photo IDs
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // Electronics
  'monitor':      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80&fit=crop',
  'screen':       'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80&fit=crop',
  'display':      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80&fit=crop',
  'keyboard':     'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=400&q=80&fit=crop',
  'mouse':        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80&fit=crop',
  'laptop':       'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80&fit=crop',
  'phone':        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80&fit=crop',
  'tablet':       'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80&fit=crop',
  'earbuds':      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80&fit=crop',
  'headphone':    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80&fit=crop',
  'headphones':   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80&fit=crop',
  'watch':        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&fit=crop',
  'smartwatch':   'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&fit=crop',
  'cable':        'https://images.unsplash.com/photo-1583394293614-82a95d25a31f?w=400&q=80&fit=crop',
  'charger':      'https://images.unsplash.com/photo-1583394293614-82a95d25a31f?w=400&q=80&fit=crop',
  'speaker':      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80&fit=crop',
  'camera':       'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80&fit=crop',
  'drone':        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80&fit=crop',
  'oximeter':     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  // Apparel
  'hoodie':       'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80&fit=crop',
  'jacket':       'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80&fit=crop',
  'shirt':        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80&fit=crop',
  'polo':         'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80&fit=crop',
  'jeans':        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&fit=crop',
  'denim':        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&fit=crop',
  'pants':        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&fit=crop',
  'shoes':        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop',
  'sneakers':     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop',
  'boots':        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop',
  'socks':        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80&fit=crop',
  'sock':         'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80&fit=crop',
  'wallet':       'https://images.unsplash.com/photo-1627123424574-724758594785?w=400&q=80&fit=crop',
  'purse':        'https://images.unsplash.com/photo-1627123424574-724758594785?w=400&q=80&fit=crop',
  'bag':          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80&fit=crop',
  'backpack':     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80&fit=crop',
  'sunglasses':   'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80&fit=crop',
  'cap':          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80&fit=crop',
  'hat':          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80&fit=crop',
  'beanie':       'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80&fit=crop',
  'chair':        'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&q=80&fit=crop',
  // Food & Groceries
  'honey':        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80&fit=crop',
  'tea':          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80&fit=crop',
  'coffee':       'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80&fit=crop',
  'beans':        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80&fit=crop',
  'bread':        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop',
  'sourdough':    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop',
  'chocolate':    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80&fit=crop',
  'candy':        'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80&fit=crop',
  'drink':        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80&fit=crop',
  'energy':       'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80&fit=crop',
  'oats':         'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80&fit=crop',
  'rice':         'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80&fit=crop',
  'oil':          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80&fit=crop',
  'salt':         'https://images.unsplash.com/photo-1571167366136-b57e7937cd08?w=400&q=80&fit=crop',
  'milk':         'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80&fit=crop',
  'almond':       'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80&fit=crop',
  'cookie':       'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop',
  'crackers':     'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop',
  // Medical
  'vitamin':      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
  'vitamins':     'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
  'supplement':   'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
  'pill':         'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
  'medtablet':    'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
  'aspirin':      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
  'bandage':      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  'bandages':     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  'spray':        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  'cream':        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&fit=crop',
  'thermometer':  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  'glucose':      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80&fit=crop',
  'blood':        'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80&fit=crop',
  'mask':         'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&q=80&fit=crop',
  'shield':       'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&q=80&fit=crop',
  'swab':         'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  'pain':         'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  'heat':         'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
}

export function getProductImage(name: string, category: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '')
  const words = cleanName.split(/\s+/).filter(w => w.length > 2)

  // Check every word in the product name against the curated map
  for (const word of words) {
    if (PRODUCT_IMAGE_MAP[word]) return PRODUCT_IMAGE_MAP[word]
  }

  // Partial match: check if any map key appears inside the full name
  for (const [key, url] of Object.entries(PRODUCT_IMAGE_MAP)) {
    if (cleanName.includes(key)) return url
  }

  // Category-level fallback
  const catFallbacks: Record<string, string> = {
    'Electronics': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80&fit=crop',
    'Apparel':     'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80&fit=crop',
    'Groceries':   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&fit=crop',
    'Food':        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80&fit=crop',
    'Medical':     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
  }
  return catFallbacks[category] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&fit=crop'
}

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Wireless Earbuds X1',         category: 'Electronics', stock: 3,   minStock: 10, price: 2499,  cost: 1100,  salesCount: 148, overstock: false, sku: 'SKU-EAR-X1',  image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80&fit=crop' },
  { id: 'p2',  name: 'Smart Charging Cable',         category: 'Electronics', stock: 45,  minStock: 15, price: 299,   cost: 120,   salesCount: 320, overstock: true,  sku: 'SKU-CAB-C4',  image: 'https://images.unsplash.com/photo-1583394293614-82a95d25a31f?w=400&q=80&fit=crop' },
  { id: 'p3',  name: 'Premium Leather Wallet',       category: 'Apparel',     stock: 12,  minStock: 5,  price: 1499,  cost: 600,   salesCount: 84,  overstock: false, sku: 'SKU-WAL-L3',  image: 'https://images.unsplash.com/photo-1627123424574-724758594785?w=400&q=80&fit=crop' },
  { id: 'p4',  name: 'Organic Green Tea (100g)',     category: 'Groceries',   stock: 2,   minStock: 20, price: 299,   cost: 100,   expiryDate: '2026-08-15', salesCount: 215, overstock: false, sku: 'SKU-TEA-G1',  image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80&fit=crop' },
  { id: 'p5',  name: 'Futuristic Hoodie',            category: 'Apparel',     stock: 8,   minStock: 10, price: 2999,  cost: 1200,  salesCount: 92,  overstock: false, sku: 'SKU-HUD-F9',  image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80&fit=crop' },
  { id: 'p6',  name: 'Vitamins Multi-Pack',          category: 'Medical',     stock: 32,  minStock: 12, price: 999,   cost: 400,   expiryDate: '2026-07-20', salesCount: 110, overstock: false, sku: 'SKU-VIT-M8',  image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop' },
  { id: 'p7',  name: 'Organic Honey (500g)',         category: 'Groceries',   stock: 65,  minStock: 15, price: 499,   cost: 200,   expiryDate: '2026-12-01', salesCount: 45, overstock: true,  sku: 'SKU-HON-O5',  image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80&fit=crop' },
  { id: 'p8',  name: 'Mechanical Keyboard RGB',      category: 'Electronics', stock: 18,  minStock: 5,  price: 4999,  cost: 2100,  salesCount: 74,  overstock: false, sku: 'SKU-KBD-R1',  image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=400&q=80&fit=crop' },
  { id: 'p9',  name: 'Premium Running Shoes',        category: 'Apparel',     stock: 24,  minStock: 8,  price: 3999,  cost: 1600,  salesCount: 132, overstock: false, sku: 'SKU-SHO-R9',  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop' },
  { id: 'p10', name: 'Gourmet Chocolate Bar',        category: 'Food',        stock: 120, minStock: 30, price: 299,   cost: 120,   expiryDate: '2026-10-30', salesCount: 540, overstock: true,  sku: 'SKU-CHO-G2',  image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80&fit=crop' },
  { id: 'p11', name: 'Energy Drink Sugar-Free',      category: 'Food',        stock: 200, minStock: 50, price: 150,   cost: 60,    expiryDate: '2026-09-15', salesCount: 890, overstock: true,  sku: 'SKU-NRG-S3',  image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80&fit=crop' },
  { id: 'p12', name: 'Pain Relief Spray',            category: 'Medical',     stock: 14,  minStock: 10, price: 299,   cost: 110,   expiryDate: '2027-02-18', salesCount: 190, overstock: false, sku: 'SKU-SPR-P2',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop' },
  { id: 'p13', name: 'Sourdough Bread',              category: 'Groceries',   stock: 5,   minStock: 8,  price: 180,   cost: 70,    expiryDate: '2026-07-04', salesCount: 280, overstock: false, sku: 'SKU-BRD-S7',  image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop' },
  { id: 'p14', name: 'Noise-Cancelling Headphones',  category: 'Electronics', stock: 15,  minStock: 4,  price: 9999,  cost: 4200,  salesCount: 64,  overstock: false, sku: 'SKU-HDPH-NC', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80&fit=crop' },
]

const DEFAULT_SALES: Sale[] = [
  { id: 's1', timestamp: '2026-07-01T10:14:00Z', productName: 'Wireless Earbuds X1', quantity: 1, total: 2499, customerName: 'Alex Johnson', rating: 5, review: 'Amazing sound quality and extremely fast drone delivery!', products: [{ productName: 'Wireless Earbuds X1', quantity: 1, price: 2499 }] },
  { id: 's2', timestamp: '2026-07-01T11:05:00Z', productName: 'Organic Green Tea (100g)', quantity: 2, total: 598, customerName: 'Sarah Smith', rating: 4, review: 'Very fresh leaves, taste is wonderful. Reordering soon.', products: [{ productName: 'Organic Green Tea (100g)', quantity: 2, price: 299 }] },
  { id: 's3', timestamp: '2026-07-01T12:30:00Z', productName: 'Futuristic Hoodie', quantity: 1, total: 2999, customerName: 'Michael Brown', rating: 5, review: 'Sleek cyberpunk design! Fits perfectly and keeps warm.', products: [{ productName: 'Futuristic Hoodie', quantity: 1, price: 2999 }] },
  { id: 's4', timestamp: '2026-07-01T14:22:00Z', productName: 'Smart Charging Cable', quantity: 3, total: 897, customerName: 'Emma Davis', rating: 3, review: 'Charges fine, but cable is a bit stiff.', products: [{ productName: 'Smart Charging Cable', quantity: 3, price: 299 }] },
  { id: 's5', timestamp: '2026-07-01T15:45:00Z', productName: 'Vitamins Multi-Pack', quantity: 1, total: 999, customerName: 'David Wilson', rating: 2, review: 'Packaging was damaged upon arrival.', products: [{ productName: 'Vitamins Multi-Pack', quantity: 1, price: 999 }] },
]

const DEFAULT_EMPLOYEES: Employee[] = [
  { 
    id: 'e1', 
    name: 'Marcus Vance', 
    role: 'Manager', 
    salary: 52000, 
    attendance: 'Present', 
    productivityScore: 94, 
    tasksAssigned: ['Restock electronics', 'Approve monthly tax schedule'], 
    shifts: ['Mon 9-5', 'Tue 9-5', 'Wed 9-5', 'Thu 9-5', 'Fri 9-5'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    phone: '+91 98765 12001',
    email: 'marcus.vance@businessos.in',
    joiningDate: '2024-01-10'
  },
  { 
    id: 'e2', 
    name: 'Clara Oswald', 
    role: 'Cashier', 
    salary: 32000, 
    attendance: 'Present', 
    productivityScore: 88, 
    tasksAssigned: ['Clean front counters', 'Verify cashier drawer balance'], 
    shifts: ['Mon 8-4', 'Wed 8-4', 'Thu 8-4', 'Fri 8-4', 'Sat 10-6'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    phone: '+91 98765 12002',
    email: 'clara.oswald@businessos.in',
    joiningDate: '2024-05-18'
  },
  { 
    id: 'e3', 
    name: 'Devon Miller', 
    role: 'Sales Associate', 
    salary: 28000, 
    attendance: 'Late', 
    productivityScore: 78, 
    tasksAssigned: ['Tag new arrivals', 'Update price boards'], 
    shifts: ['Tue 10-6', 'Wed 10-6', 'Thu 10-6', 'Fri 10-6', 'Sun 12-8'],
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150',
    phone: '+91 98765 12003',
    email: 'devon.miller@businessos.in',
    joiningDate: '2025-02-11'
  },
  { 
    id: 'e4', 
    name: 'Elena Rostova', 
    role: 'Admin', 
    salary: 65000, 
    attendance: 'Present', 
    productivityScore: 97, 
    tasksAssigned: ['Review fraud detection alerts', 'Update cloud database config'], 
    shifts: ['Mon 9-5', 'Tue 9-5', 'Wed 9-5', 'Thu 9-5', 'Fri 9-5'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
    phone: '+91 98765 12004',
    email: 'elena.rostova@businessos.in',
    joiningDate: '2023-08-22'
  },
]

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Alex Johnson', email: 'alex.j@example.com', segment: 'Loyal', clv: 2450.50, lastPurchase: '2026-07-01', feedbackScore: 5, feedbackText: 'Best store in town. The AI recommendations are spot on!' },
  { id: 'c2', name: 'Sarah Smith', email: 'sarah.s@example.com', segment: 'Active', clv: 890.00, lastPurchase: '2026-07-01', feedbackScore: 4, feedbackText: 'Great product selection. Delivery was a bit slow last week.' },
  { id: 'c3', name: 'Michael Brown', email: 'mbrown@example.com', segment: 'Active', clv: 1250.00, lastPurchase: '2026-07-01', feedbackScore: 5, feedbackText: 'I love the clothing collection. High quality material.' },
  { id: 'c4', name: 'Alice Wonder', email: 'alice.w@example.com', segment: 'Inactive', clv: 340.00, lastPurchase: '2026-04-12', feedbackScore: 3, feedbackText: 'Decent, but I feel prices could be more competitive.' },
  { id: 'c5', name: 'Bob Vance', email: 'bob@vancerefrigeration.com', segment: 'Churn Risk', clv: 2100.00, lastPurchase: '2026-02-18', feedbackScore: 2, feedbackText: 'Used to buy weekly but support took 3 days to answer last time.' },
]

const DEFAULT_CAMPAIGNS: MarketingCampaign[] = [
  { id: 'm1', platform: 'Instagram', title: 'Summer Tech Splash', status: 'Active', date: '2026-07-01', clicks: 1240, conversion: 4.8, copy: 'Upgrade your audio game! Grab the Wireless Earbuds X1 today and enjoy 20% off. Use code: TECHSUMMER.', hashtags: '#audiophile #techlife #summerstyle #deals', imagePrompt: 'Futuristic wireless earbuds floating in neon blue splash background, cinematic lighting' },
  { id: 'm2', platform: 'Email Marketing', title: 'Loyalty Appreciation Month', status: 'Scheduled', date: '2026-07-04', clicks: 0, conversion: 0, copy: 'Hi [Name], we value your business! Here is a personalized 15% discount code for your next order...', hashtags: '', imagePrompt: '' },
  { id: 'm3', platform: 'WhatsApp', title: 'Weekend Restock Notification', status: 'Completed', date: '2026-06-28', clicks: 890, conversion: 8.5, copy: 'Hello! Organic Green Tea is back in stock at a special price of $12.50. Tap link to buy now!', hashtags: '', imagePrompt: '' }
]

const DEFAULT_REQUESTS: CustomerRequest[] = [
  { id: 'r1', customerName: 'Logan Roy', requestText: 'Need 10 boxes of Premium Swiss Chocolates for an event.', productRequested: 'Premium Swiss Chocolates', timestamp: '2026-07-01T11:45:00Z', priority: 'High', status: 'Pending' },
  { id: 'r2', customerName: 'Walter White', requestText: 'Looking for 99.9% pure glassware cylinders.', productRequested: 'Glassware Cylinders', timestamp: '2026-07-01T12:00:00Z', priority: 'Medium', status: 'Pending' },
  { id: 'r3', customerName: 'Jessica Carter', requestText: 'Please restock Vitamins Multi-Pack urgently.', productRequested: 'Vitamins Multi-Pack', timestamp: '2026-07-01T09:30:00Z', priority: 'Low', status: 'Completed', replyText: 'Added to inventory!' }
]

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'msg1', sender: 'customer', text: 'Hello! Are the wireless earbuds in stock?', timestamp: '2026-07-01T10:15:00Z', type: 'text', seen: true },
  { id: 'msg2', sender: 'owner', text: 'Yes, we have a few units of Wireless Earbuds X1 left on the shelves!', timestamp: '2026-07-01T10:16:00Z', type: 'text', seen: true }
]

const STORAGE_KEY = 'businessos_db_state'

export function loadDBState(): AppDBState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.products && parsed.sales && parsed.employees && parsed.customerRequests && parsed.chatMessages) {
        // Force update employee info to match defaults if avatars or key info are outdated/missing
        let updated = false

        // Check if each default product still matches - force update by ID for accurate images
        const defaultProductMap = new Map(DEFAULT_PRODUCTS.map(p => [p.id, p]))
        const updatedProducts = parsed.products.map((p: Product) => {
          const isStaleUrl = (
            !p.image ||
            !p.image.startsWith('http') ||
            p.image.includes('unsplash.com/featured') ||
            p.image.includes('source.unsplash.com') ||
            p.image.includes('loremflickr.com')
          )
          // If it's a default product, always use the hardcoded accurate image
          const defaultProd = defaultProductMap.get(p.id)
          if (defaultProd) {
            if (p.image !== defaultProd.image) {
              updated = true
              return { ...p, image: defaultProd.image }
            }
            return p
          }
          // For custom uploaded products: regenerate if URL is stale
          if (isStaleUrl) {
            updated = true
            return { ...p, image: getProductImage(p.name, p.category) }
          }
          return p
        })

        const updatedEmployees = parsed.employees.map((emp: Employee) => {
          const defaultEmp = DEFAULT_EMPLOYEES.find(e => e.id === emp.id)
          if (defaultEmp && (emp.avatar !== defaultEmp.avatar || !emp.email || emp.salary < 10000)) {
            updated = true
            return {
              ...emp,
              avatar: defaultEmp.avatar,
              phone: defaultEmp.phone,
              email: defaultEmp.email,
              joiningDate: defaultEmp.joiningDate,
              salary: defaultEmp.salary
            }
          }
          return emp
        })

        const updatedSales = parsed.sales.map((sale: Sale) => {
          const defaultSale = DEFAULT_SALES.find(s => s.id === sale.id)
          if (defaultSale && (sale.rating !== defaultSale.rating || sale.review !== defaultSale.review)) {
            updated = true
            return {
              ...sale,
              rating: defaultSale.rating,
              review: defaultSale.review
            }
          }
          return sale
        })

        if (updated) {
          parsed.products = updatedProducts
          parsed.employees = updatedEmployees
          parsed.sales = updatedSales
          saveDBState(parsed)
        }
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load local DB state:', e)
  }

  const initialState: AppDBState = {
    products: DEFAULT_PRODUCTS,
    sales: DEFAULT_SALES,
    employees: DEFAULT_EMPLOYEES,
    customers: DEFAULT_CUSTOMERS,
    campaigns: DEFAULT_CAMPAIGNS,
    customerRequests: DEFAULT_REQUESTS,
    chatMessages: DEFAULT_CHAT_MESSAGES,
    automations: {
      whatsappOffers: true,
      instagramPost: false,
      customerReplies: true,
      emailInvoices: true,
      gstGeneration: true,
    },
    logs: [
      '[Firebase Auth] Initialized security listener on port 443.',
      '[MongoDB] Connected to database cluster: store-mind-prod-0.',
      '[Firestore] Successfully synced collections: products, users, config.',
      '[AI Core] Model loaded: Gemini Pro v1.5 API. Cognitive engine functional.',
      '[System] BusinessOS AI booting sequence complete. Status: ONLINE.'
    ]
  }
  saveDBState(initialState)
  return initialState
}

export function saveDBState(state: AppDBState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save DB state to localStorage:', e)
  }
}

export function addLog(state: AppDBState, message: string): AppDBState {
  const time = new Date().toLocaleTimeString()
  const formattedLog = `[${time}] ${message}`
  const newLogs = [formattedLog, ...state.logs].slice(0, 100) // cap at 100
  const updated = { ...state, logs: newLogs }
  saveDBState(updated)
  return updated
}



