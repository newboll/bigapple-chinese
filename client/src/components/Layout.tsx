import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Globe, Check, Settings, LogOut, BookOpen, ShoppingBag, Shield } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Button } from './ui/button';
import logoImg from '@client/src/assets/logo.png';
import { useTranslation } from '@client/src/i18n/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Image } from '@client/src/components/ui/image';

const Layout = () => {
  const { cart, user, logout } = useApp();
  const { t, language, setLanguage } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAdminUser = (() => {
    try {
      const raw = localStorage.getItem('bigapple-current-admin');
      return !!raw;
    } catch {
      return false;
    }
  })();

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/books', label: t('nav.bookstore') },
    { to: '/books?level=0', label: t('nav.levelAB') },
    { to: '/books?level=1', label: t('nav.level1') },
    { to: '/books?level=2', label: t('nav.level2') },
    { to: '/books?level=3', label: t('nav.level3') },
    { to: '/books?level=4', label: t('nav.level4') },
    { to: '/books?level=5', label: t('nav.level5') },
    { to: '/books?level=6', label: t('nav.level6') },
  ];

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentLevel = searchParams.get('level');

  const isBookstoreActive = location.pathname === '/books' && !currentLevel;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <Image src={logoImg} alt="Big Apple Chinese" className="w-9 h-9 rounded-full object-cover" />
              <div className="hidden sm:block text-left">
                <div className="text-base font-semibold text-foreground leading-tight tracking-tight">Big Apple</div>
                <div className="text-[11px] text-muted-foreground leading-tight">大苹果汉语</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 h-16">
              {navItems.slice(0, 2).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => {
                    const active = item.to === '/books' ? isBookstoreActive : isActive;
                    return `px-3 h-full flex items-center text-sm font-medium transition-colors border-b-2 ${
                      active
                        ? 'text-primary border-primary'
                        : 'text-foreground/80 border-transparent hover:text-primary hover:border-primary/30'
                    }`;
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex items-center gap-0.5 ml-2 h-full">
                {navItems.slice(2).map((item) => {
                  const levelMatch = item.to.match(/level=(\d)/);
                  const itemLevel = levelMatch ? levelMatch[1] : null;
                  const active = currentLevel === itemLevel;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`px-2 h-full flex items-center text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                        active
                          ? 'text-primary border-primary'
                          : 'text-muted-foreground border-transparent hover:text-primary hover:border-primary/30'
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder={t('common.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-44 pl-9 pr-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5" aria-label={t('nav.language')}>
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-medium">{language === 'en' ? 'EN' : '中'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    {language === 'en' && <Check className="w-4 h-4" />}
                    {language !== 'en' && <span className="w-4" />}
                    {t('nav.en')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('zh')}>
                    {language === 'zh' && <Check className="w-4 h-4" />}
                    {language !== 'zh' && <span className="w-4" />}
                    {t('nav.zhCN')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative" aria-label={t('nav.cart')}>
                  <ShoppingCart className="w-5 h-5 text-foreground/80" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={t('nav.myAccount')}>
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/account/books" className="cursor-pointer">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t('nav.myBooks')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/orders" className="cursor-pointer">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {t('nav.myOrders')}
                      </Link>
                    </DropdownMenuItem>
                    {isAdminUser && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          {t('nav.adminConsole')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/account/login">
                  <Button variant="default" size="sm" className="hidden sm:inline-flex">
                    {t('nav.login')}
                  </Button>
                </Link>
              )}

              <button
                className="lg:hidden p-2 rounded-md hover:bg-muted text-foreground/80"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={t('common.menu')}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <div className="px-4 py-3 space-y-2">
              <form onSubmit={handleSearch} className="md:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder={t('common.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </form>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/80 hover:bg-muted'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user && (
                <>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="px-3 py-2 text-sm font-medium text-foreground">{user.name}</div>
                    <NavLink
                      to="/account/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                    >
                      {t('nav.myOrders')}
                    </NavLink>
                    <NavLink
                      to="/account/books"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                    >
                      {t('nav.myBooks')}
                    </NavLink>
                    {isAdminUser && (
                      <NavLink
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                      >
                        {t('nav.adminConsole')}
                      </NavLink>
                    )}
                    <NavLink
                      to="/account/login-history"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                    >
                      {t('account.loginHistory')}
                    </NavLink>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <Link
                  to="/account/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary"
                >
                  {t('nav.login')} / {t('nav.register')}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-muted/30 border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Image src={logoImg} alt="Big Apple Chinese" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm text-foreground">Big Apple Chinese</div>
                  <div className="text-[11px] text-muted-foreground">大苹果汉语</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('home.footerDesc')}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">{t('nav.levels')}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/books?level=1" className="hover:text-foreground transition-colors">{t('nav.level1')}</Link></li>
                <li><Link to="/books?level=2" className="hover:text-foreground transition-colors">{t('nav.level2')}</Link></li>
                <li><Link to="/books?level=3" className="hover:text-foreground transition-colors">{t('nav.level3')}</Link></li>
                <li><Link to="/books?level=4" className="hover:text-foreground transition-colors">{t('nav.level4')}</Link></li>
                <li><Link to="/books?level=5" className="hover:text-foreground transition-colors">{t('nav.level5')}</Link></li>
                <li><Link to="/books?level=6" className="hover:text-foreground transition-colors">{t('nav.level6')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">{t('home.footerQuickLinks')}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">{t('home.aboutTitle')}</Link></li>
                <li><Link to="/books" className="hover:text-foreground transition-colors">{t('home.browseAll')}</Link></li>
                <li><Link to="/admin/login" className="hover:text-foreground transition-colors">{t('home.adminPortal')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">{t('home.footerContact')}</h4>
              <div className="text-xs text-muted-foreground space-y-1.5">
                <p>{t('common.author')}</p>
                <p>{t('common.illustrator')}</p>
                <p>{t('common.publisher')}</p>
                <p className="text-primary">bigapplechinese.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 mt-8 pt-5 text-center text-[11px] text-muted-foreground/70">
            <p>{t('home.footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
