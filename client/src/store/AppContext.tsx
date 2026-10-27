import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User, CartItem, Book, Order } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { loginAudit } from '@client/src/api';

interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  updateCartQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: string) => Order | null;
  isPurchased: (bookId: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'bigapple-app-state';

function loadState(): { user: User | null; cart: CartItem[]; orders: Order[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user || null,
        cart: parsed.cart || [],
        orders: parsed.orders || [],
      };
    }
  } catch {
    // ignore
  }
  return { user: null, cart: [], orders: [] };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = loadState();
  const [user, setUser] = useState<User | null>(initial.user);
  const [cart, setCart] = useState<CartItem[]>(initial.cart);
  const [orders, setOrders] = useState<Order[]>(initial.orders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, cart, orders }));
  }, [user, cart, orders]);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    const existing = JSON.parse(localStorage.getItem('bigapple-users') || '[]') as User[];
    let found = existing.find((u) => u.email === email);
    if (!found) {
      found = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        purchasedBookIds: [],
        createdAt: new Date().toISOString(),
      };
      existing.push(found);
      localStorage.setItem('bigapple-users', JSON.stringify(existing));
    }
    setUser(found);
    try {
      await loginAudit.createLoginAudit({
        accountType: 'member',
        accountIdentifier: email,
        userId: found.id,
        success: true,
        deviceInfo: navigator.userAgent.slice(0, 500),
      });
    } catch (e) {
      logger.error('上报会员登录审计失败', e);
    }
    return true;
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    const existing = JSON.parse(localStorage.getItem('bigapple-users') || '[]') as User[];
    if (existing.some((u) => u.email === email)) {
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      purchasedBookIds: [],
      createdAt: new Date().toISOString(),
    };
    existing.push(newUser);
    localStorage.setItem('bigapple-users', JSON.stringify(existing));
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addToCart = useCallback((book: Book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        return prev.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { bookId: book.id, book, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((bookId: string) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  }, []);

  const updateCartQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.bookId !== bookId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item,
        ),
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const checkout = useCallback((paymentMethod: string): Order | null => {
    if (cart.length === 0) return null;

    const total = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: Math.round(total * 100) / 100,
      status: 'paid',
      createdAt: new Date().toISOString(),
      paymentMethod,
    };

    setOrders((prev) => [order, ...prev]);
    setUser((prev) => {
      if (!prev) return prev;
      const purchasedIds = cart.map((item) => item.bookId);
      const newPurchased = [...new Set([...prev.purchasedBookIds, ...purchasedIds])];
      const updated = { ...prev, purchasedBookIds: newPurchased };
      const users = JSON.parse(localStorage.getItem('bigapple-users') || '[]') as User[];
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx >= 0) {
        users[idx] = updated;
        localStorage.setItem('bigapple-users', JSON.stringify(users));
      }
      return updated;
    });
    setCart([]);

    return order;
  }, [cart]);

  const isPurchased = useCallback((bookId: string): boolean => {
    return user?.purchasedBookIds.includes(bookId) ?? false;
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        orders,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
        isPurchased,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
