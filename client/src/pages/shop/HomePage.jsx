import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await productApi.getAll({ sort: 'newest', limit: 8 });
        setNewProducts(res?.data?.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative bg-gray-900 h-[500px]">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover opacity-70" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000" alt="Banner" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Khám Phá <br/><span className="text-primary-400">Phong Cách Mới</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-lg">
            Bộ sưu tập mùa hè mới nhất với thiết kế hiện đại, trẻ trung và phong cách.
          </p>
          <div>
            <Link to="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition">
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Sản Phẩm Mới</h2>
            <p className="mt-2 text-gray-500">Cập nhật những xu hướng thời trang mới nhất</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium group">
            Xem tất cả <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        ) : newProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            Hiện tại chưa có sản phẩm nào. Đang cập nhật...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Feature Banner */}
      <div className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ưu Đãi Đặc Biệt</h2>
          <p className="text-lg text-gray-600 mb-8">Giảm ngay 20% cho đơn hàng đầu tiên của bạn.</p>
          <Link to="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition">
            Đăng ký thành viên
          </Link>
        </div>
      </div>
    </div>
  );
}
