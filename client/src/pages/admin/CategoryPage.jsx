import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../../api/categoryApi';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FolderTree
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getAll();
      setCategories(res?.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      await categoryApi.delete(id);

      toast.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa danh mục');
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Quản lý Danh Mục
        </h1>

        <Link
          to="/admin/categories/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition"
        >
          <Plus size={20} className="mr-2" />
          Thêm danh mục
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Danh mục</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Danh mục cha</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>

                    <p className="mt-4 text-gray-500 font-medium">
                      Đang tải dữ liệu...
                    </p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <FolderTree className="text-gray-400" size={24} />
                    </div>

                    <p className="text-lg font-medium text-gray-900">
                      Không tìm thấy danh mục nào
                    </p>

                    <p className="mt-1">
                      Thử điều chỉnh từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Category */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={
                            category.image?.url ||
                            'https://via.placeholder.com/60'
                          }
                          alt={category.name}
                          className="w-14 h-14 rounded-md object-cover mr-4 shadow-sm border border-gray-100"
                        />

                        <div>
                          <div className="font-semibold text-gray-900">
                            {category.name}
                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            ID: {category._id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                        {category.slug}
                      </span>
                    </td>

                    {/* Parent */}
                    <td className="px-6 py-4">
                      {category.parent_id ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                          {category.parent_id?.name || 'Danh mục cha'}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Danh mục gốc
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      {category.isActive ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle size={14} className="mr-1.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle size={14} className="mr-1.5" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        to={`/admin/categories/${category._id}/edit`}
                        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </Link>

                      <button
                        onClick={() => handleDelete(category._id)}
                        className="inline-flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
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