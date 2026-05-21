import React, { useEffect, useState } from 'react';
import { 
  adminApi 
} from '../../api/adminApi'; // Điều chỉnh đường dẫn này cho đúng cấu trúc thư mục của bạn
import {
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  User,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  ShieldAlert,
  UserMinus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Thống kê nhanh số lượng người dùng
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    user: 0,
    locked: 0
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Gọi đúng hàm getUsers từ Object adminApi được cung cấp
      const res = await adminApi.getUsers();
      const userData = res?.data || [];
      setUsers(userData);
      calculateStats(userData);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const calculateStats = (userData) => {
    const statsObj = userData.reduce((acc, current) => {
      acc.total++;
      if (current.role === 'admin') acc.admin++;
      if (current.role === 'user') acc.user++;
      if (!current.isActive) acc.locked++;
      return acc;
    }, { total: 0, admin: 0, user: 0, locked: 0 });
    
    setStats(statsObj);
  };

  // Hàm xử lý Khóa / Mở khóa tài khoản nhanh
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatusText = currentStatus ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${nextStatusText} tài khoản này?`)) return;

    try {
      await adminApi.updateUser(id, { isActive: !currentStatus });
      toast.success(`Đã ${nextStatusText} tài khoản thành công`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Thao tác cập nhật trạng thái thất bại');
    }
  };

  // Hàm xóa tài khoản người dùng
  const handleDelete = async (id) => {
    if (!window.confirm('Hành động này không thể hoàn tác! Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      await adminApi.delete(id);
      toast.success('Xóa tài khoản thành công');
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa người dùng');
    }
  };

  // Xử lý bộ lọc kết hợp Tìm kiếm + Role + Trạng thái
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-gray-600">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Quản lý Người Dùng
        </h1>
      </div>

      {/* Thẻ số liệu thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Tổng thành viên</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={22} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Quản trị viên (Admin)</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.admin}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck size={22} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Khách hàng (User)</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.user}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck size={22} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Tài khoản bị khóa</p>
            <p className="text-2xl font-bold text-red-600">{stats.locked}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <UserX size={22} />
          </div>
        </div>
      </div>

      {/* Khối quản lý danh sách & Bộ lọc */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Thanh lọc dữ liệu */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 w-full flex-1">
            {/* Ô tìm kiếm tên hoặc email */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Tìm tên hoặc email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition bg-white text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* Lọc theo Vai trò */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="user">Người dùng (User)</option>
            </select>

            {/* Lọc theo Trạng thái hoạt động */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đang bị khóa</option>
            </select>
          </div>
        </div>

        {/* Bảng dữ liệu người dùng */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu khách hàng...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <UserMinus className="text-gray-400" size={24} />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Không tìm thấy người dùng nào</p>
                    <p className="mt-1 text-sm">Thử thay đổi từ khóa hoặc bộ lọc trạng thái</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Thông tin cá nhân */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mr-4 shadow-sm font-semibold capitalize">
                          {user.name ? user.name.charAt(0) : <User size={18} />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize">{user.name || 'Chưa cập nhật'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {user._id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Vai trò */}
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <ShieldAlert size={12} className="mr-1" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <User size={12} className="mr-1" /> Khách hàng
                        </span>
                      )}
                    </td>

                    {/* Ngày tạo tài khoản */}
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>

                    {/* Trạng thái hoạt động */}
                    <td className="px-6 py-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle size={14} className="mr-1.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          <XCircle size={14} className="mr-1.5" /> Bị khóa
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Nút khóa/mở khóa nhanh */}
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                          user.isActive
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        {user.isActive ? 'Khóa TK' : 'Mở khóa'}
                      </button>

                      {/* Nút xóa tài khoản hẳn khỏi hệ thống */}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}