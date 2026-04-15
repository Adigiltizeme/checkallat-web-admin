// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'client' | 'pro' | 'driver' | 'seller' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Pro Types
export interface Pro {
  id: string;
  userId: string;
  user: User;
  companyName?: string;
  bio?: string;
  serviceCategories: string[];
  serviceAreaRadius: number;
  segment: 'standard' | 'premium';
  isStudyltizemeGraduate: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  averageRating?: number;
  totalReviews: number;
  totalCompletedBookings: number;
  acceptanceRate: number;
  cancellationRate: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  user: User;
  vehicleType: string;
  licensePlate: string;
  licenseNumber?: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  averageRating?: number;
  completedTrips: number;
  onTimeRate: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Seller Types
export interface Seller {
  id: string;
  userId: string;
  user: User;
  businessName: string;
  address: string;
  categories: string[];
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  averageRating?: number;
  productsCount: number;
  completedSales: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  sellerId: string;
  seller: Seller;
  name: string;
  description: string;
  category: string;
  price: number;
  status: 'pending' | 'active' | 'rejected';
  images: string[];
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  clientId: string;
  proId?: string;
  driverId?: string;
  type: 'service' | 'transport' | 'marketplace';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  completedAt?: string;
  finalPrice: number;
  paymentMethod: 'cash' | 'card';
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'cash' | 'card';
  status: 'pending' | 'completed' | 'failed';
  escrowStatus: 'held' | 'released' | 'refunded';
  commissionAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Dispute Types
export interface Dispute {
  id: string;
  bookingId: string;
  booking?: Booking;
  requestedById: string;
  requestedBy: User;
  type: string;
  description: string;
  status: 'pending' | 'resolved';
  resolution?: string;
  resolvedInFavorOf?: 'client' | 'pro';
  refundAmount?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Stats Types
export interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  averageRating: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Filter Types
export interface ProFilters {
  status?: string;
  search?: string;
  segment?: string;
  category?: string;
}

export interface TransactionFilters {
  status?: string;
  escrowStatus?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface DisputeFilters {
  status?: string;
  type?: string;
}
