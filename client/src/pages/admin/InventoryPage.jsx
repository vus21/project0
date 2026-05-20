import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Minus, Save, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { useNavigate, useParams } from 'react-router-dom';
import InventoryFormPage from './InventoryFormPage';
export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedProducts, setExpandedProducts] = useState({});
  const [editingStock, setEditingStock] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
 const [openInventoryModal, setOpenInventoryModal] = useState(false);
   const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  
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
      console.error('Error fetching inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleStockChange = (productId, sku, value) => {
    setEditingStock(prev => ({
      ...prev,
      [`${productId}-${sku}`]: value
    }));
  };

  const handleSaveStock = async (productId, sku) => {
    const stockValue = editingStock[`${productId}-${sku}`];
    if (stockValue === undefined || stockValue === '') return;

    try {
      await productApi.updateStock(productId, sku, { stock: parseInt(stockValue) });
      // Refresh data
      fetchData();
      // Clear editing state
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[`${productId}-${sku}`];
        return newState;
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Cập nhật tồn kho thất bại');
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?._id === selectedCategory);
    }

    // Tab filter
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
    if (stock === 0) return { text: 'Hết hàng', color: 'text-red-600 bg-red-100' };
    if (stock < 10) return { text: 'Sắp hết', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Còn hàng', color: 'text-green-600 bg-green-100' };
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Quản lý kho hàng</h1>
        
        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Tổng sản phẩm</p>
            <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Tổng tồn kho</p>
            <p className="text-3xl font-bold text-white">{stats.totalStock}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Sắp hết hàng</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.lowStock}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Hết hàng</p>
            <p className="text-3xl font-bold text-red-500">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'low', label: 'Sắp hết' },
            { key: 'out', label: 'Hết hàng' },
            { key: 'hidden', label: 'Đang ẩn' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-left text-white">Sản phẩm</th>
              <th className="px-6 py-4 font-semibold text-left text-white">Danh mục</th>
              <th className="px-6 py-4 font-semibold text-right text-white">Tồn kho</th>
              <th className="px-6 py-4 font-semibold text-right text-white">Đã bán</th>
              <th className="px-6 py-4 font-semibold text-center text-white">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-center text-white">Hiển thị</th>
              <th className="px-6 py-4 font-semibold text-right text-white">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const status = getStockStatus(product.totalStock);
              return (
                <React.Fragment key={product._id}>
                  <tr className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-sm text-gray-400">{product.variants?.length || 0} variants</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{product.category?.name || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-white">{product.totalStock || 0}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{product.sold || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-white">
                        {product.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setOpenInventoryModal(true);
                          }}
                          className="flex items-center gap-1 text-green-400 hover:text-green-300"
                          title="Nhập thêm"
                        >
                          <Plus size={16} />
                          Nhập thêm
                        </button>
                        <button
                          onClick={() => toggleExpand(product._id)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                        >
                          Variants
                          {expandedProducts[product._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Variants */}
                  {expandedProducts[product._id] && (
                    <tr className="bg-gray-750">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-gray-400 text-sm">
                                <th className="pb-2">SKU</th>
                                <th className="pb-2">Màu</th>
                                <th className="pb-2">Size</th>
                                <th className="pb-2 text-right">Tồn kho</th>
                                <th className="pb-2 text-right">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.variants?.map(variant => (
                                <tr key={variant.sku} className="border-t border-gray-600">
                                  <td className="py-3 text-white font-mono text-sm">{variant.sku}</td>
                                  <td className="py-3 text-gray-300">{variant.color}</td>
                                  <td className="py-3 text-gray-300">{variant.size}</td>
                                  <td className="py-3 text-right">
                                    <input
                                      type="number"
                                      value={editingStock[`${product._id}-${variant.sku}`] ?? variant.stock}
                                      onChange={(e) => handleStockChange(product._id, variant.sku, e.target.value)}
                                      className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-right focus:outline-none focus:border-blue-500"
                                      min="0"
                                    />
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => handleSaveStock(product._id, variant.sku)}
                                      className="p-1 text-blue-400 hover:text-blue-300"
                                      title="Lưu"
                                    >
                                      <Save size={16} />
                                    </button>
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
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            Không tìm thấy sản phẩm nào
          </div>
        )}
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