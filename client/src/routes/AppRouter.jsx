import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import UserLayout from '../components/layout/UserLayout';
import AdminLayout from '../components/layout/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/shop/HomePage';
import DashboardPage from '../pages/admin/DashboardPage';
import ProductsPage from '../pages/admin/ProductsPage';
import ProductFormPage from '../pages/admin/ProductFormPage';
import CategoriesPage from '../pages/admin/CategoryPage';
import CategoriesFormPage from '../pages/admin/CategoriesFormPage';
import InventoryPage from '../pages/admin/InventoryPage';
import InventoryFormPage from '../pages/admin/InventoryFormPage';
import UserPage from '../pages/admin/UserPage';
import AllProductsPage from '../pages/shop/ProductsPage';
import ProductDetailPage from '../pages/shop/ProductDetails';
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<AllProductsPage/>} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        
        {/* Protected Routes cho User */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<div>Profile Page (Coming soon)</div>} />
          <Route path="/cart" element={<div>Cart Page (Coming soon)</div>} />
        </Route>
      </Route>

      {/* Admin Routes bảo mật tuyệt đối */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/products/new" element={<ProductFormPage />} />
          <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/inventory/:id" element={<InventoryFormPage />} />
          <Route path="/admin/orders" element={<div className="p-8 text-xl font-bold">Quản lý Đơn hàng (Coming soon)</div>} />
          <Route path="/admin/categories" element={ <CategoriesPage />} />
          <Route path="/admin/categories/new" element={<CategoriesFormPage />} />
          <Route path="/admin/categories/:id/edit" element={<CategoriesFormPage />} />
          <Route path="/admin/users" element={<UserPage/>} />
          <Route path="/admin/users/:id/edit" element={<div className="p-8 text-xl font-bold">Sửa Người dùng (Coming soon)</div>} />
          <Route path="/admin/vouchers" element={<div className="p-8 text-xl font-bold">Quản lý Voucher (Coming soon)</div>} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 Not Found</h1></div>} />
    </Routes>
  );
}
