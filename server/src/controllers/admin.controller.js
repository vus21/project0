import { asyncHandler } from '../middlewares/asyncHandler.js';
import { adminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  ApiResponse.success(res, stats, 'Lấy dữ liệu tổng quan thành công');
});

export const getRevenueChart = asyncHandler(async (req, res) => {
  const chartData = await adminService.getRevenueChart(req.query.year);
  ApiResponse.success(res, chartData, 'Lấy dữ liệu biểu đồ thành công');
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await adminService.getTopSellingProducts(req.query.limit);
  ApiResponse.success(res, products, 'Lấy sản phẩm bán chạy thành công');
});

export const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await adminService.getRecentOrders(req.query.limit);
  ApiResponse.success(res, orders, 'Lấy đơn hàng gần đây thành công');
});

export const getLowStock = asyncHandler(async (req, res) => {
  const products = await adminService.getLowStockAlert(req.query.threshold);
  ApiResponse.success(res, products, 'Lấy cảnh báo tồn kho thành công');
});

export const getSalesByCategory = asyncHandler(async (req, res) => {
  const sales = await adminService.getSalesByCategory();
  ApiResponse.success(res, sales, 'Lấy doanh thu theo danh mục thành công');
});
