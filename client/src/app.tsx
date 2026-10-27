import React from 'react';
import { Route, Routes } from 'react-router-dom';

import I18nProvider from './i18n/useTranslation';
import Layout from './components/Layout';
import { AppProvider } from './store/AppContext';
import NotFound from './pages/NotFound/NotFound';

import HomePage from './pages/Home/HomePage';
import BooksPage from './pages/Books/BooksPage';
import BookDetail from './pages/BookDetail/BookDetail';
import ReaderPage from './pages/Reader/ReaderPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccess/OrderSuccessPage';
import LoginPage from './pages/account/LoginPage';
import RegisterPage from './pages/account/RegisterPage';
import OrdersPage from './pages/account/OrdersPage';
import MyBooksPage from './pages/account/MyBooksPage';
import LoginHistoryPage from './pages/account/LoginHistoryPage';
import { AdminProvider } from './admin/AdminContext';
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminBooksPage from './admin/pages/AdminBooksPage';
import AdminOrdersPage from './admin/pages/AdminOrdersPage';
import AdminMembersPage from './admin/pages/AdminMembersPage';
import AdminAdminsPage from './admin/pages/AdminAdminsPage';
import AdminRolesPage from './admin/pages/AdminRolesPage';
import AdminAuditLogsPage from './admin/pages/AdminAuditLogsPage';
import AdminLoginAuditsPage from './admin/pages/AdminLoginAuditsPage';

const RoutesComponent = () => {
  return (
    <I18nProvider>
      <AppProvider>
        <AdminProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="book/:id" element={<BookDetail />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
              <Route path="account/login" element={<LoginPage />} />
              <Route path="account/register" element={<RegisterPage />} />
              <Route path="account/orders" element={<OrdersPage />} />
              <Route path="account/books" element={<MyBooksPage />} />
              <Route path="account/login-history" element={<LoginHistoryPage />} />
            </Route>
            <Route path="reader/:id" element={<ReaderPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
            <Route path="admin/books" element={<AdminLayout><AdminBooksPage /></AdminLayout>} />
            <Route path="admin/orders" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
            <Route path="admin/members" element={<AdminLayout><AdminMembersPage /></AdminLayout>} />
            <Route path="admin/admins" element={<AdminLayout><AdminAdminsPage /></AdminLayout>} />
            <Route path="admin/roles" element={<AdminLayout><AdminRolesPage /></AdminLayout>} />
            <Route path="admin/audit-logs" element={<AdminLayout><AdminAuditLogsPage /></AdminLayout>} />
            <Route path="admin/login-audits" element={<AdminLayout><AdminLoginAuditsPage /></AdminLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminProvider>
      </AppProvider>
    </I18nProvider>
  );
};

export default RoutesComponent;
