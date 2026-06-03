import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { voucherApi } from '../../api/voucherApi'; // Đảm bảo đường dẫn đúng
import {
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Ticket,
  Calendar,
  Users,
  TrendingUp,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // State cho Form (Thêm/Sửa)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await voucherApi.getAllVouchers();
      setVouchers(Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
    } catch (error) {
      toast.error('Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      await voucherApi.deleteVoucher(id);
      setVouchers(prev => prev.filter(v => v._id !== id));
      toast.success('Xóa mã giảm giá thành công');
    } catch (error) {
      toast.error('Không thể xóa voucher');
    }
  };

  // Xử lý Bật/Tắt hoạt động
  const handleToggleActive = async (voucher) => {
    try {
      const newStatus = !voucher.isActive;
      await voucherApi.updateVoucher(voucher._id, { isActive: newStatus });
      setVouchers(prev => prev.map(v => v._id === voucher._id ? { ...v, isActive: newStatus } : v));
      toast.success(`${newStatus ? 'Kích hoạt' : 'Hủy kích hoạt'} thành công`);
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  // Mở form Thêm/Sửa
  const openForm = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      reset({
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue,
        maxDiscount: voucher.maxDiscount || '',
        usageLimit: voucher.usageLimit,
        expiredAt: new Date(voucher.expiredAt).toISOString().split('T')[0],
        isActive: voucher.isActive
      });
    } else {
      setEditingVoucher(null);
      reset({
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        minOrderValue: 0,
        maxDiscount: '',
        usageLimit: 1,
        expiredAt: '',
        isActive: true
      });
    }
    setIsFormOpen(true);
  };

  // Gửi Form
  const onSubmit = async (data) => {
    try {
      if (editingVoucher) {
        await voucherApi.updateVoucher(editingVoucher._id, data);
        toast.success('Cập nhật thành công');
      } else {
        await voucherApi.createVoucher(data);
        toast.success('Thêm voucher mới thành once');
      }
      setIsFormOpen(false);
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu voucher');
    }
  };

  // --- Logic Thống kê & Bộ lọc 
  // ---
  const stats = useMemo(() => {
    if (!vouchers.length) return { totalUsed: 0, topVoucher: 'N/A' };
    const totalUsed = vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0);
    const top = [...vouchers].sort((a, b) => b.usedCount - a.usedCount)[0];
    return { totalUsed, topVoucher: top?.code || 'N/A' };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'active' ? v.isActive : !v.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Mã Giảm Giá</h1>
        <button
          onClick={() => openForm()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus size={20} className="mr-2" /> Thêm Voucher mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Tổng lượt đã dùng</p>
            <p className="text-xl font-bold">{stats.totalUsed}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Dùng nhiều nhất</p>
            <p className="text-xl font-bold text-amber-600">{stats.topVoucher}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Ticket size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-xl font-bold">{vouchers.filter(v => v.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã voucher (VD: SUMMER20)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Đang tắt</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã / Loại</th>
                <th className="px-6 py-4 font-semibold">Giá trị giảm</th>
                <th className="px-6 py-4 font-semibold text-center">Sử dụng (Đã dùng/Tổng)</th>
                <th className="px-6 py-4 font-semibold">Hết hạn</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" /> Đang tải...</td></tr>
              ) : filteredVouchers.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">Không tìm thấy voucher nào</td></tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 uppercase">{v.code}</div>
                      <div className="text-[10px] text-gray-400">{v.discountType === 'PERCENT' ? 'Theo phần trăm' : 'Số tiền cố định'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-indigo-600">
                        {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
                      </div>
                      <div className="text-[11px] text-gray-400 font-sans">Đơn tối thiểu: {v.minOrderValue?.toLocaleString()}đ</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-700">{v.usedCount} / {v.usageLimit}</span>
                        <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full" 
                            style={{ width: `${Math.min((v.usedCount/v.usageLimit)*100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">Còn lại: {v.usageLimit - v.usedCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 font-sans">
                        <Calendar size={14} />
                        {new Date(v.expiredAt).toLocaleDateString('vi-VN')}
                      </div>
                      {new Date(v.expiredAt) < new Date() && (
                        <span className="text-[10px] text-red-500 font-medium">Đã hết hạn</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleActive(v)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {v.isActive ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                        {v.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openForm(v)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(v._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- INTEGRATED FORM MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editingVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Mã Voucher *</label>
                  <input 
                    {...register('code', { required: 'Mã không được để trống' })}
                    placeholder="VD: GIAMGIA10"
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500 uppercase font-bold"
                  />
                  {errors.code && <p className="text-[10px] text-red-500">{errors.code.message}</p>}
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Loại giảm giá</label>
                  <select 
                    {...register('discountType')}
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (đ)</option>
                  </select>
                </div>

                {/* Value */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Giá trị giảm *</label>
                  <input 
                    type="number"
                    {...register('discountValue', { required: true, min: 0 })}
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Usage Limit */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tổng lượt dùng *</label>
                  <input 
                    type="number"
                    {...register('usageLimit', { required: true, min: 1 })}
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Min Order */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Đơn tối thiểu (đ)</label>
                  <input 
                    type="number"
                
                    {...register('minOrderValue')}
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Expiry */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Ngày hết hạn *</label>
                  <input 
                    type="date"
                    {...register('expiredAt', { required: true })}
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                {/* Max Discount (Only for Percent) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Giảm tối đa (đ)</label>
                  <input 
                    type="number"
                    {...register('maxDiscount')}
                    placeholder="Không giới hạn"
                    className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" {...register('isActive')} id="formIsActive" className="w-5 h-5 accent-indigo-600" />
                  <label htmlFor="formIsActive" className="text-sm font-medium text-gray-700">Kích hoạt ngay</label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  {editingVoucher ? 'Cập nhật ngay' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}