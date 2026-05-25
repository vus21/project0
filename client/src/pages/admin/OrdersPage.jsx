import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  User,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Việt hóa các trạng thái đơn hàng
const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền'
};

const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipping: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-gray-50 text-gray-700 border-gray-200'
};

const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền'
};

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  refunded: 'bg-slate-50 text-slate-700 border-slate-200'
};

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    today: { orders: 0, revenue: 0 },
    pendingCount: 0,
    processingCount: 0,
    shippingCount: 0,
    deliveredCount: 0,
    cancelledCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  // Xem chi tiết & Cập nhật trạng thái
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Fetch Danh sách đơn hàng từ Server
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchTerm.trim() || undefined,
        orderStatus: statusFilter !== 'all' ? statusFilter : undefined,
        paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined
      };
      
      const res = await orderApi.getAllOrders(params);
      const data = res?.data || {};
      
      setOrders(data.orders || []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotalOrders(res?.pagination?.total || 0);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Thống kê từ Server
  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await orderApi.getStats();
      const statsData = res?.data || {};
      
      // Tính toán các trạng thái
      const statusCounts = {};
      if (statsData.ordersByStatus) {
        statsData.ordersByStatus.forEach(item => {
          statusCounts[item._id] = item.count;
        });
      }

      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        today: statsData.today || { orders: 0, revenue: 0 },
        pendingCount: statusCounts['pending'] || 0,
        confirmedCount: statusCounts['confirmed'] || 0,
        processingCount: statusCounts['processing'] || 0,
        shippingCount: statusCounts['shipping'] || 0,
        deliveredCount: statusCounts['delivered'] || 0,
        cancelledCount: statusCounts['cancelled'] || 0
      });
    } catch (error) {
      console.error('Lỗi khi tải thống kê đơn hàng:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Xử lý tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (!statusToUpdate) return;
    setIsUpdatingStatus(true);
    try {
      const res = await orderApi.updateStatus(selectedOrder._id, statusToUpdate, adminNote);
      toast.success('Cập nhật trạng thái đơn hàng thành công');
      
      // Update local state
      const updatedOrder = res?.data || { ...selectedOrder, orderStatus: statusToUpdate };
      setSelectedOrder(updatedOrder);
      
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, orderStatus: statusToUpdate } : o));
      setAdminNote('');
      
      // Refresh dữ liệu
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Xác định các bước trạng thái tiếp theo khả dụng dựa trên mô hình server
  const getAllowedTransitions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipping'];
      case 'shipping':
        return ['delivered', 'refunded'];
      default:
        return [];
    }
  };

  const allowedStatuses = selectedOrder ? getAllowedTransitions(selectedOrder.orderStatus) : [];

  return (
    <div className="space-y-6 text-gray-600">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi, xác nhận và cập nhật trạng thái đơn hàng của hệ thống.</p>
        </div>
        <button
          onClick={() => {
            fetchOrders();
            fetchStats();
            toast.success('Đã làm mới dữ liệu');
          }}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition"
        >
          <RefreshCw size={16} className="mr-2" /> Làm mới
        </button>
      </div>

      {/* Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Tổng doanh thu</p>
            <p className="text-xl font-bold text-gray-900">{isStatsLoading ? '...' : formatPrice(stats.totalRevenue)}</p>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center mt-1">
              <TrendingUp size={12} className="mr-0.5" /> Chốt đơn thành công
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Đơn hàng hôm nay */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Đơn hôm nay</p>
            <p className="text-xl font-bold text-gray-900">{isStatsLoading ? '...' : `${stats.today.orders} đơn`}</p>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block">
              Doanh thu: {formatPrice(stats.today.revenue)}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar size={22} />
          </div>
        </div>

        {/* Đang chờ xử lý */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Chờ xác nhận</p>
            <p className="text-xl font-bold text-yellow-600">{isStatsLoading ? '...' : `${stats.pendingCount} đơn`}</p>
            <span className="text-[10px] text-yellow-600 font-medium flex items-center mt-1">
              <Clock size={12} className="mr-0.5 animate-pulse" /> Cần phê duyệt ngay
            </span>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock size={22} />
          </div>
        </div>

        {/* Đang giao hàng */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Đang giao</p>
            <p className="text-xl font-bold text-indigo-600">{isStatsLoading ? '...' : `${stats.shippingCount} đơn`}</p>
            <span className="text-[10px] text-indigo-600 font-medium flex items-center mt-1">
              <Truck size={12} className="mr-0.5" /> Đang trên đường đi
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Truck size={22} />
          </div>
        </div>
      </div>

      {/* Bộ Lọc & Tìm kiếm & Bảng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Thanh lọc dữ liệu */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 w-full flex-1">
            {/* Search Box */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Tìm mã đơn hàng (ORD-...)"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition bg-white text-gray-900 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* Trạng thái đơn */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái đơn</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Trạng thái thanh toán */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none cursor-pointer"
            >
              <option value="all">Tất cả thanh toán</option>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition font-medium"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Danh Sách Đơn Hàng */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã đơn hàng</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Ngày đặt</th>
                <th className="px-6 py-4 font-semibold text-right">Tổng tiền</th>
                <th className="px-6 py-4 font-semibold text-center">Thanh toán</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái đơn</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Đang tải danh sách đơn hàng...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-400" size={24} />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Không tìm thấy đơn hàng nào</p>
                    <p className="mt-1 text-sm">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Mã đơn */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-900 block">{order.orderCode || `ORD-${order._id.slice(-6).toUpperCase()}`}</span>
                      {order.paymentMethod && (
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-0.5">
                          {order.paymentMethod}
                        </span>
                      )}
                    </td>

                    {/* Khách hàng */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 capitalize">{order.shippingAddress?.fullName || order.user?.name || 'Khách vãng lai'}</div>
                      <div className="text-xs text-gray-400 font-medium mt-0.5">{order.shippingAddress?.phone || order.user?.email || '-'}</div>
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>

                    {/* Tổng tiền */}
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </td>

                    {/* Trạng thái thanh toán */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${PAYMENT_STATUS_COLORS[order.paymentStatus] || 'bg-gray-50 text-gray-700'}`}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </td>

                    {/* Trạng thái đơn */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-50 text-gray-700'}`}>
                        {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setStatusToUpdate('');
                          setAdminNote('');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg text-xs font-semibold border border-transparent transition-all"
                      >
                        <Eye size={14} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Hiển thị đơn hàng {(page - 1) * limit + 1} - {Math.min(page * limit, totalOrders)} của {totalOrders} đơn hàng
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${page === i + 1 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal / Sidebar Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40 animate-fade-in">
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
          
          {/* Modal Panel content */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <span className="text-xs font-mono text-gray-400 mt-1 block">ID: {selectedOrder._id}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              {/* Cột thông tin trạng thái & hành động */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Mã đơn hàng</span>
                    <span className="font-mono font-bold text-gray-900 text-lg">{selectedOrder.orderCode || 'Chưa tạo'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${ORDER_STATUS_COLORS[selectedOrder.orderStatus]}`}>
                      Đơn hàng: {ORDER_STATUS_LABELS[selectedOrder.orderStatus]}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus]}`}>
                      Thanh toán: {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]}
                    </span>
                  </div>
                </div>

                {/* Cập nhật Trạng thái */}
                {allowedStatuses.length > 0 ? (
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Cập nhật trạng thái đơn hàng</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={statusToUpdate}
                        onChange={(e) => setStatusToUpdate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">-- Chọn trạng thái tiếp theo --</option>
                        {allowedStatuses.map(status => (
                          <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
                        ))}
                        {selectedOrder.orderStatus !== 'cancelled' && (
                          <option value="cancelled">Hủy đơn hàng này</option>
                        )}
                      </select>
                      
                      <button
                        disabled={!statusToUpdate || isUpdatingStatus}
                        onClick={handleUpdateStatus}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingStatus ? 'Đang lưu...' : 'Lưu cập nhật'}
                      </button>
                    </div>

                    {statusToUpdate === 'cancelled' && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Lý do hủy đơn</label>
                        <textarea
                          rows="2"
                          placeholder="Nhập lý do hủy đơn (sẽ gửi cho khách hàng)..."
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-3 flex items-center text-xs text-gray-500 font-medium">
                    <CheckCircle size={16} className="mr-1 text-green-600" /> Đơn hàng này đã kết thúc ở trạng thái chốt: <strong>{ORDER_STATUS_LABELS[selectedOrder.orderStatus]}</strong>. Không thể chuyển tiếp trạng thái.
                  </div>
                )}
              </div>

              {/* Thông tin Khách hàng & Địa chỉ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm border-b pb-2 flex items-center gap-1.5">
                    <User size={16} className="text-gray-400" /> Thông tin khách hàng
                  </h4>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p><strong>Người mua:</strong> <span className="capitalize">{selectedOrder.user?.name || 'Ẩn danh'}</span></p>
                    <p><strong>Email đăng ký:</strong> {selectedOrder.user?.email || '-'}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.shippingAddress?.phone || '-'}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm border-b pb-2 flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400" /> Địa chỉ giao nhận
                  </h4>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p><strong>Người nhận:</strong> {selectedOrder.shippingAddress?.fullName}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.shippingAddress?.phone}</p>
                    <p><strong>Địa chỉ chi tiết:</strong> {selectedOrder.shippingAddress?.detail}</p>
                    <p><strong>Phường / Xã:</strong> {selectedOrder.shippingAddress?.ward}</p>
                    <p><strong>Quận / Thành phố:</strong> {selectedOrder.shippingAddress?.city}</p>
                  </div>
                </div>
              </div>

              {/* Ghi chú từ khách hàng */}
              {selectedOrder.note && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Ghi chú từ khách hàng</span>
                  <p className="text-xs text-amber-700 italic">"{selectedOrder.note}"</p>
                </div>
              )}

              {/* Chi tiết sản phẩm mua */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm border-b pb-2 flex items-center gap-1.5">
                  <Package size={16} className="text-gray-400" /> Sản phẩm mua sắm
                </h4>
                <div className="divide-y divide-gray-100">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.sku} className="py-3 flex gap-4 items-center">
                      <div className="w-12 h-14 bg-gray-50 border border-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-10/12 h-full object-cover mx-auto" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-xs truncate capitalize">{item.name}</h5>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          SKU: <span className="font-mono">{item.sku}</span> | Phân loại: <span>{item.color || '-'}</span> / <span>{item.size || '-'}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-gray-900">{formatPrice(item.price)}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Số lượng: x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chi tiết tài chính */}
              <div className="border-t border-gray-150 pt-4 space-y-2 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between">
                  <span>Giá trị sản phẩm:</span>
                  <span className="font-medium">{formatPrice(selectedOrder.itemPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span className="font-medium">{formatPrice(selectedOrder.shippingPrice)}</span>
                </div>
                {selectedOrder.discountPrice > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Giảm giá Voucher {selectedOrder.voucher?.code && `(${selectedOrder.voucher.code})`}:</span>
                    <span>-{formatPrice(selectedOrder.discountPrice)}</span>
                  </div>
                )}
                <hr className="border-gray-250 my-1" />
                <div className="flex justify-between items-baseline text-sm font-bold text-gray-900 pt-1">
                  <span>Tổng thanh toán:</span>
                  <span className="text-lg text-primary-600 font-serif font-bold">{formatPrice(selectedOrder.totalPrice)}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-150 transition"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
