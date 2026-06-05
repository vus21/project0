import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Boxes,
  Layers,
  AlertTriangle,
  FileX
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'react-hot-toast';
import InventoryFormPage from './InventoryFormPage';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedProducts, setExpandedProducts] = useState({});
  const [editingStock, setEditingStock] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll()
      ]);

      const productsData = productsRes?.data || [];
      setProducts(productsData);
      setCategories(categoriesRes?.data || []);
      calculateStats(productsData);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu kho hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateStats = (productsData) => {
    let totalStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    productsData.forEach(product => {
      totalStock += product.totalStock || 0;
      if (product.totalStock === 0) outOfStock++;
      else if (product.totalStock < 10) lowStock++;
    });

    setStats({
      totalProducts: productsData.length,
      totalStock,
      lowStock,
      outOfStock
    });
  };

  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // const handleStockChange = (productId, sku, value) => {
  //   setEditingStock(prev => ({
  //     ...prev,
  //     [`${productId}-${sku}`]: value
  //   }));
  // };

  const handleSaveStock = async (productId, sku) => {
    const stockValue = editingStock[`${productId}-${sku}`];
    if (stockValue === undefined || stockValue === '') return;

    try {
      await productApi.updateStock(productId, sku, { stock: parseInt(stockValue) });
      toast.success('Cập nhật tồn kho thành công');
      fetchData();
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[`${productId}-${sku}`];
        return newState;
      });
    } catch (error) {
      toast.error(error.message || 'Cập nhật tồn kho thất bại');
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id?._id === selectedCategory);
    }

    if (activeTab === 'low') {
      filtered = filtered.filter(p => p.totalStock > 0 && p.totalStock < 10);
    } else if (activeTab === 'out') {
      filtered = filtered.filter(p => p.totalStock === 0);
    } else if (activeTab === 'hidden') {
      filtered = filtered.filter(p => !p.isActive);
    }

    return filtered;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'bg-red-100 text-red-700 border border-red-200' };
    if (stock < 10) return { text: 'Sắp hết', color: 'bg-amber-100 text-amber-700 border border-amber-200' };
    return { text: 'Còn hàng', color: 'bg-green-100 text-green-700 border border-green-200' };
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="space-y-6 animate-fade-in text-gray-600">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Quản lý Kho Hàng
        </h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Tổng sản phẩm</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Boxes size={22} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Tổng tồn kho</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Layers size={22} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Sắp hết hàng</p>
            <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={22} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Hết hàng</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Table & Filters Block */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters Panel */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition bg-white text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none cursor-pointer"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-gray-200/60 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'low', label: 'Sắp hết' },
              { key: 'out', label: 'Hết hàng' },
              { key: 'hidden', label: 'Đang ẩn' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-all ${activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold">Danh mục</th>
                <th className="px-6 py-4 font-semibold text-right">Tồn kho</th>
                <th className="px-6 py-4 font-semibold text-right">Đã bán</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Hiển thị</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <FileX className="text-gray-400" size={24} />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm nào</p>
                    <p className="mt-1 text-sm">Thử điều chỉnh từ khóa hoặc bộ lọc tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const status = getStockStatus(product.totalStock);
                  return (
                    <React.Fragment key={product._id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        {/* Information */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {/* {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-14 h-14 rounded-md object-cover mr-4 shadow-sm border border-gray-100"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 rounded-md mr-4 border border-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )} */}
                            <div>
                              <div className="font-semibold text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {product.variants?.length || 0} phiên bản
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          {product.category?.name ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {product.totalStock || 0}
                        </td>

                        {/* Sold */}
                        <td className="px-6 py-4 text-right text-gray-500 font-medium">
                          {product.sold || 0}
                        </td>

                        {/* Stock Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </td>

                        {/* Active Visibility */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {product.isActive ? (
                              <>
                                <CheckCircle size={12} className="mr-1" /> Hiển thị
                              </>
                            ) : (
                              <>
                                <XCircle size={12} className="mr-1" /> Đang ẩn
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setOpenInventoryModal(true);
                            }}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-medium transition"
                            title="Nhập thêm"
                          >
                            <Plus size={14} className="mr-1" /> Nhập kho
                          </button>
                          <button
                            onClick={() => toggleExpand(product._id)}
                            className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${expandedProducts[product._id]
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            Chi tiết
                            {expandedProducts[product._id] ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                          </button>
                        </td>
                      </tr>

                      {/* Sub-table for Variants */}
                      {expandedProducts[product._id] && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100 pb-2">
                                    <th className="pb-2 font-semibold">SKU</th>
                                    <th className="pb-2 font-semibold">Màu sắc</th>
                                    <th className="pb-2 font-semibold">Kích thước</th>
                                    <th className="pb-2 text-right font-semibold">Tồn kho</th>
                                    {/* <th className="pb-2 text-right font-semibold">Thao tác</th> */}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {product.variants?.map(variant => (
                                    <tr key={variant.sku} className="hover:bg-gray-50/30 transition-colors">
                                      <td className="py-2.5 font-mono text-xs text-gray-600">{variant.sku}</td>
                                      <td className="py-2.5 text-gray-700 font-medium">{variant.color || '-'}</td>
                                      <td className="py-2.5 text-gray-700">{variant.size || '-'}</td>
                                      <td className="py-2.5 text-right">
                                        <input
                                          type="number"
                                          value={editingStock[`${product._id}-${variant.sku}`] ?? variant.stock}
                                          // onChange={(e) => handleStockChange(product._id, variant.sku, e.target.value)}
                                          readOnly
                                          className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-right text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                          min="0"
                                        />
                                      </td>
                                      <td className="py-2.5 text-right">
                                        {/* <button
                                          onClick={() => handleSaveStock(product._id, variant.sku)}
                                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                                          title="Lưu số lượng"
                                        >
                                          <Save size={16} />
                                        </button> */}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Form Modal */}
      <InventoryFormPage
        product={selectedProduct}
        open={openInventoryModal}
        onClose={() => {
          setOpenInventoryModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          fetchData();
          setOpenInventoryModal(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}