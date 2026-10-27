export interface Book {
  id: string;
  title: string;
  pinyin: string;
  level: number;
  levelName: string;
  description: string;
  price: number;
  coverColor: string;
  coverImage?: string;
  pageImages?: string[];
  pdfUrl?: string;
  totalPages: number;
  previewPages: number;
  author: string;
  illustrator: string;
  isNew?: boolean;
  isFeatured?: boolean;
  category: string;
  publisher?: string;
}

export interface CartItem {
  bookId: string;
  book: Book;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  paymentMethod: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  purchasedBookIds: string[];
  createdAt: string;
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export type PermissionResource =
  | 'dashboard'
  | 'books'
  | 'orders'
  | 'members'
  | 'admins'
  | 'roles'
  | 'auditLogs'
  | 'loginAudits';

export interface RolePermission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface AdminRole {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  permissions: RolePermission[];
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  roleIds: string[];
  createdAt: string;
  isSuperAdmin?: boolean;
}

export interface AuditLog {
  id: string;
  adminUsername: string;
  adminName?: string;
  adminRoles: string[];
  module: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  beforeValues?: Record<string, unknown>;
  afterValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogListParams {
  page?: number;
  pageSize?: number;
  adminUsername?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAuditLogRequest {
  adminUsername: string;
  adminName?: string;
  adminRoles: string[];
  module: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  beforeValues?: Record<string, unknown>;
  afterValues?: Record<string, unknown>;
}

export interface LoginAudit {
  id: string;
  accountType: 'admin' | 'member';
  accountIdentifier: string;
  userId?: string;
  success: boolean;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: string;
}

export interface LoginAuditListParams {
  page?: number;
  pageSize?: number;
  accountType?: 'admin' | 'member';
  accountIdentifier?: string;
  userId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface LoginAuditListResponse {
  items: LoginAudit[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateLoginAuditRequest {
  accountType: 'admin' | 'member';
  accountIdentifier: string;
  userId?: string;
  success: boolean;
  failureReason?: string;
  deviceInfo?: string;
}

export interface ReadingProgressItem {
  userId: string;
  bookId: string;
  totalSeconds: number;
  lastReadAt: string;
}

export interface ReportReadingProgressRequest {
  bookId: string;
  totalSeconds: number;
  lastReadAt: string;
}

export interface UserReadingProgressResponse {
  items: ReadingProgressItem[];
}

export interface MemberReadingDetailItem {
  bookId: string;
  bookTitle: string;
  bookCoverColor?: string;
  bookCoverImage?: string;
  totalSeconds: number;
  lastReadAt: string;
}

export interface MemberReadingDetailResponse {
  items: MemberReadingDetailItem[];
  totalSeconds: number;
}

export interface DashboardReadingStats {
  totalSeconds: number;
  activeReaders: number;
  totalBooks: number;
}
