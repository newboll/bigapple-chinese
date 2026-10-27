import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  BookMarked,
  ClipboardList,
  LogIn,
  Globe,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@client/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@client/src/components/ui/dropdown-menu';
import { useAdmin } from './AdminContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import type { Language } from '@client/src/i18n/useTranslation';
import type { PermissionResource } from '@shared/api.interface';

interface MenuItem {
  key: PermissionResource;
  labelKey: string;
  icon: React.ElementType;
  path: string;
}

const menuItems: MenuItem[] = [
  { key: 'dashboard', labelKey: 'admin.dashboard', icon: LayoutDashboard, path: '/admin' },
  { key: 'books', labelKey: 'admin.books', icon: BookOpen, path: '/admin/books' },
  { key: 'orders', labelKey: 'admin.orders', icon: ShoppingCart, path: '/admin/orders' },
  { key: 'members', labelKey: 'admin.members', icon: Users, path: '/admin/members' },
  { key: 'admins', labelKey: 'admin.admins', icon: Shield, path: '/admin/admins' },
  { key: 'roles', labelKey: 'admin.roles', icon: Settings, path: '/admin/roles' },
  { key: 'auditLogs', labelKey: 'admin.auditLogs', icon: ClipboardList, path: '/admin/audit-logs' },
  { key: 'loginAudits', labelKey: 'admin.loginAudits', icon: LogIn, path: '/admin/login-audits' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, hasPermission, logout } = useAdmin();
  const { t, language, setLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const visibleMenu = menuItems.filter((item) => hasPermission(item.key, 'view'));

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-200 bg-white border-r border-border flex flex-col overflow-hidden flex-shrink-0`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border flex-shrink-0">
          <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">Big Apple Admin</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {t('admin.consoleSubtitle')}
            </p>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-rose-50 text-rose-600 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground">
              {admin.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{admin.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">@{admin.username}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('admin.logout')}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{t('admin.consoleName')}</span>
          </div>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5" aria-label={t('nav.language')}>
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {language === 'en' ? 'EN' : '中'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onClick={() => setLanguage('en' as Language)}>
                {language === 'en' && <Check className="w-4 h-4" />}
                {language !== 'en' && <span className="w-4" />}
                {t('nav.en')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('zh' as Language)}>
                {language === 'zh' && <Check className="w-4 h-4" />}
                {language !== 'zh' && <span className="w-4" />}
                {t('nav.zhCN')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
