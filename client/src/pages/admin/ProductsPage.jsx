import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';

import {
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  PackageSearch
} from 'lucide-react';

import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const res = await productApi.getAllAdmin({
        limit: 100
      });

      // Đảm bảo luôn là array
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Lỗi khi tải danh sách sản phẩm'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa sản phẩm này?'
    );

    if (!confirmed) return;

    try {
      await productApi.delete(id);

      // Optimistic update thay vì fetch lại
      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      );

      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Lỗi khi xóa sản phẩm'
      );
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product?.name
        ?.toLowerCase()
        ?.includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Quản lý Sản Phẩm
        </h1>

        <Link
          to="/admin/products/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition"
        >
          <Plus size={20} className="mr-2" />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm bằng tên..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
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
                <th className="px-6 py-4 font-semibold">
                  Sản phẩm
                </th>

                <th className="px-6 py-4 font-semibold">
                  Danh mục
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Giá bán
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Tồn kho
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Đã bán
                </th>

                <th className="px-6 py-4 font-semibold text-center">
                  Trạng thái
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {isLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>

                    <p className="mt-4 text-gray-500 font-medium">
                      Đang tải dữ liệu...
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                /* Empty */
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <PackageSearch
                        className="text-gray-400"
                        size={24}
                      />
                    </div>

                    <p className="text-lg font-medium text-gray-900">
                      Không tìm thấy sản phẩm nào
                    </p>

                    <p className="mt-1">
                      Thử điều chỉnh từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              ) : (
        
                filteredProducts.map((product) => {
                  const finalPrice =
                    product?.discountPrice &&
                    product.discountPrice > 0
                      ? product.discountPrice
                      : product.basePrice;

                  const hasDiscount =
                    product?.discountPrice > 0 &&
                    product.discountPrice <
                      product.basePrice;

                  return (
                    <tr
                      key={product._id}
                      className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={
                              product?.images?.[0]?.url ||
                              'https://via.placeholder.com/60'
                            }
                            className="w-14 h-14 rounded-md object-cover mr-4 shadow-sm border border-gray-100"
                            alt={product?.name || 'product'}
                          />

                          <div>
                            <div className="font-semibold text-gray-900 max-w-[250px] truncate">
                              {product?.name}
                            </div>

                            <div className="text-xs text-gray-500 mt-1 max-w-[250px] truncate">
                              {product?.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {product?.category_id ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                              {product.category_id.name}
                            </span>

                            {product.category_id
                              ?.parent_id?.name && (
                              <div className="text-xs text-gray-400">
                                Parent:{' '}
                                {
                                  product.category_id
                                    .parent_id.name
                                }
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Chưa có danh mục
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-gray-900">
                          {currencyFormatter.format(
                            finalPrice || 0
                          )}
                        </div>

                        {hasDiscount && (
                          <div className="text-xs text-gray-400 line-through mt-0.5">
                            {currencyFormatter.format(
                              product.basePrice
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                            (product?.totalStock || 0) <= 10
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {product?.totalStock || 0}
                        </span>
                      </td>

                      {/* Sold */}
                      <td className="px-6 py-4 font-medium text-gray-900 text-right">
                        {product?.sold || 0}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {product?.isActive ? (
                          <button onClick={async () => { await productApi.update(product._id, { isActive: false }), fetchProducts()}} className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle
                              size={14}
                              className="mr-1.5"
                            />
                            Active
                          </button>
                        ) : (
                          <button onClick={async () => {await productApi.update(product._id, { isActive: true }), fetchProducts()}} className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle
                              size={14}
                              className="mr-1.5"
                            />
                            Inactive
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                        <Link
                          to={`/admin/products/${product.slug}/edit`}
                          className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(product._id)
                          }
                          className="inline-flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}