export type Role = 'SUP' | 'ADMIN' | 'COMPANY_ADMIN' | 'REP'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  isActive: boolean
  managerId?: string
  territoryId?: string
  assignedSectorId?: string
  createdAt: string
  updatedAt: string
}

export interface Territory {
  id: string
  name: string
  type: 'PAYS' | 'REGION' | 'ZONE' | 'SECTEUR'
  parentId?: string
  adminId?: string
  admin?: User
  children?: Territory[]
  description?: string
  createdAt: string
}

export interface Outlet {
  id: string
  name: string
  address: string
  channel: string
  latitude?: number
  longitude?: number
  phone?: string
  status: 'PENDING' | 'VALIDATED' | 'REJECTED'
  territoryId?: string
  sectorId?: string
  territory?: Territory
  createdAt: string
}

export interface Visit {
  id: string
  userId: string
  outletId: string
  checkinAt: string
  checkoutAt?: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  outlet?: Outlet
  user?: User
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  outletId: string
  status: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  totalHt: number
  totalTtc: number
  items: OrderItem[]
  outlet?: Outlet
  user?: User
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: Product
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  category?: string
  brand?: string
  isActive: boolean
}

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalOutlets: number
  pendingOutlets: number
  totalOrders: number
  totalRevenue: number
  todayVisits: number
  todaySales: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  tenantId?: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
