import type { AdminRole, AdminUser, PermissionResource, PermissionAction, User, Order } from '@shared/api.interface';
import { allBooks } from '@client/src/data/books';

const ADMINS_KEY = 'bigapple-admins';
const ROLES_KEY = 'bigapple-admin-roles';
const CURRENT_ADMIN_KEY = 'bigapple-current-admin';
const USERS_KEY = 'bigapple-users';
const APP_STATE_KEY = 'bigapple-app-state';
const MOCK_SEEDED_KEY = 'bigapple-admin-mock-seeded';

const mockMemberNames = [
  'Emma Chen', 'Liam Wang', 'Olivia Li', 'Noah Zhang', 'Sophia Liu',
  'Jackson Wu', 'Ava Zhou', 'Lucas Sun', 'Mia Lin', 'Aiden Huang',
  'Chloe Xu', 'Ethan Yang', 'Isabella Zhao', 'Mason Sun', 'Lily Chen',
  'Logan Wang', 'Grace Li', 'Benjamin Zhang', 'Zoe Liu', 'William Wu',
];

export function ensureMockMembersAndOrders(): void {
  try {
    if (localStorage.getItem(MOCK_SEEDED_KEY)) return;
    const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
    if (existingUsers.length > 0) {
      localStorage.setItem(MOCK_SEEDED_KEY, '1');
      return;
    }

    const now = Date.now();
    const users: User[] = mockMemberNames.map((name, i) => {
      const email = name.toLowerCase().replace(' ', '.') + '@example.com';
      const daysAgo = Math.floor(Math.random() * 180);
      return {
        id: `user-mock-${i + 1}`,
        email,
        name,
        purchasedBookIds: [] as string[],
        createdAt: new Date(now - daysAgo * 86400 * 1000).toISOString(),
      };
    });

    const statuses: Order['status'][] = ['pending', 'paid', 'completed', 'cancelled'];
    const orders: Order[] = [];
    let orderNum = 1000;

    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const bookCount = 1 + Math.floor(Math.random() * 3);
      const items: Order['items'] = [];
      const picked = new Set<string>();
      for (let j = 0; j < bookCount; j++) {
        const book = allBooks[Math.floor(Math.random() * allBooks.length)];
        if (picked.has(book.id)) continue;
        picked.add(book.id);
        items.push({
          bookId: book.id,
          book,
          quantity: 1,
        });
        if (!user.purchasedBookIds.includes(book.id)) {
          user.purchasedBookIds.push(book.id);
        }
      }
      const total = items.reduce((s, it) => s + it.book.price, 0);
      const daysAgo = Math.floor(Math.random() * 90);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      orders.push({
        id: `ORD-${orderNum++}`,
        items,
        total,
        status,
        createdAt: new Date(now - daysAgo * 86400 * 1000).toISOString(),
        paymentMethod: 'credit_card',
      } as Order);
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const rawState = localStorage.getItem(APP_STATE_KEY);
    const state = rawState ? JSON.parse(rawState) : {};
    state.orders = orders;
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    localStorage.setItem(MOCK_SEEDED_KEY, '1');
  } catch {
    // ignore
  }
}

const defaultRoles: AdminRole[] = [
  {
    id: 'super-admin',
    name: '超级管理员',
    nameEn: 'Super Admin',
    description: '拥有全部权限，可管理管理员和角色',
    descriptionEn: 'Full access, including admin & role management',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'books', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'members', actions: ['view', 'edit', 'delete'] },
      { resource: 'admins', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'auditLogs', actions: ['view'] },
      { resource: 'loginAudits', actions: ['view'] },
    ],
  },
  {
    id: 'editor',
    name: '内容编辑',
    nameEn: 'Editor',
    description: '管理书籍内容，可新增、编辑、下架书籍',
    descriptionEn: 'Manage books: create, edit, unpublish',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'books', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'support',
    name: '客服运营',
    nameEn: 'Support',
    description: '查看订单和会员，处理订单状态',
    descriptionEn: 'View & manage orders and members',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'orders', actions: ['view', 'edit'] },
      { resource: 'members', actions: ['view'] },
    ],
  },
  {
    id: 'viewer',
    name: '只读访客',
    nameEn: 'Viewer',
    description: '只能查看数据看板和列表',
    descriptionEn: 'Read-only access to dashboards and lists',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'books', actions: ['view'] },
      { resource: 'orders', actions: ['view'] },
      { resource: 'members', actions: ['view'] },
    ],
  },
];

const defaultAdmins: AdminUser[] = [
  {
    id: 'admin-001',
    username: 'admin',
    name: '超级管理员',
    roleIds: ['super-admin'],
    createdAt: new Date('2025-01-01').toISOString(),
    isSuperAdmin: true,
  },
];

function ensureRoles(): AdminRole[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminRole[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
  return defaultRoles;
}

function ensureAdmins(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMINS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminUser[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
  return defaultAdmins;
}

export function getRoles(): AdminRole[] {
  return ensureRoles();
}

export function getRoleById(id: string): AdminRole | undefined {
  return getRoles().find((r) => r.id === id);
}

export function saveRoles(roles: AdminRole[]): void {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function getAdmins(): AdminUser[] {
  return ensureAdmins();
}

export function getAdminById(id: string): AdminUser | undefined {
  return getAdmins().find((a) => a.id === id);
}

export function saveAdmins(admins: AdminUser[]): void {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

export function getCurrentAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (raw) return JSON.parse(raw) as AdminUser;
  } catch {
    // ignore
  }
  return null;
}

export function setCurrentAdmin(admin: AdminUser | null): void {
  if (admin) {
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
  } else {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
  }
}

export function adminLogin(username: string, _password: string): AdminUser | null {
  const admins = ensureAdmins();
  const found = admins.find((a) => a.username === username);
  if (found) {
    setCurrentAdmin(found);
    return found;
  }
  return null;
}

export function adminLogout(): void {
  setCurrentAdmin(null);
}

export function getAdminPermissions(admin: AdminUser): Record<PermissionResource, PermissionAction[]> {
  const roles = ensureRoles();
  const userRoles = admin.roleIds
    .map((rid) => roles.find((r) => r.id === rid))
    .filter((r): r is AdminRole => !!r);

  const permMap: Record<string, Set<PermissionAction>> = {};
  for (const role of userRoles) {
    for (const perm of role.permissions) {
      if (!permMap[perm.resource]) permMap[perm.resource] = new Set();
      for (const action of perm.actions) {
        permMap[perm.resource].add(action);
      }
    }
  }

  const result = {} as Record<PermissionResource, PermissionAction[]>;
  for (const [resource, actions] of Object.entries(permMap)) {
    result[resource as PermissionResource] = Array.from(actions);
  }
  return result;
}

export function hasPermission(
  permissions: Record<PermissionResource, PermissionAction[]>,
  resource: PermissionResource,
  action: PermissionAction = 'view',
): boolean {
  return permissions[resource]?.includes(action) ?? false;
}
