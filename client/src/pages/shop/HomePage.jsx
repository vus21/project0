import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
} from 'lucide-react';

import { productApi } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import ChatbotWidget from '../../pages/chatbot/chatbotWidget';
import oldmanLogo from '../../assets/oldman_logo.png';

export default function HomePage() {
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [newRes, bestSellerRes] = await Promise.all([
          productApi.getAll({
            sort: 'updatedAt_desc',
            limit: 8,
          }),

          productApi.getAll({
            sort: 'sold_desc',
            limit: 8,
          }),
        ]);
        // console.log('New Arrivals:', newRes?.data);
        setNewProducts(
          newRes?.data || []
        );

        setBestSellerProducts(
          bestSellerRes?.data || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="
            h-[420px]
            rounded-[28px]
            bg-white
            border border-[#e7dccb]
            animate-pulse
          "
        />
      ))}
    </div>
  );

  return (
    <div className="bg-[#f8f5ef] text-[#1f1a14] overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center">

        {/* Background */}
        <div className="absolute inset-0">
          <ChatbotWidget />
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
            alt="Banner"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,180,131,0.18),transparent_40%)]" />

        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">

          <div className="max-w-3xl">

            {/* Logo */}
            <div className="flex items-center gap-5 mb-10">

              <img
                src={oldmanLogo}
                alt="OLDMAN"
                className="w-20 h-20 object-contain"
              />

              <div>

                <p className="text-[#d4b483] uppercase tracking-[6px] text-sm mb-2">
                  Classic Style
                </p>

                <h1 className="text-5xl md:text-7xl font-semibold tracking-[10px] text-white">
                  OLDMAN
                </h1>

              </div>

            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-6xl leading-tight font-light mb-8 text-white">

              Thời Trang Dành Cho
              <br />

              <span className="text-[#d4b483] font-semibold">
                Quý Ông Hiện Đại
              </span>

            </h2>

            {/* Desc */}
            <p className="text-lg md:text-xl text-[#f3e6cf] leading-8 max-w-2xl mb-10">

              Tối giản, lịch lãm và vượt thời gian.
              OLDMAN mang đến phong cách cổ điển hiện đại
              dành cho người đàn ông trưởng thành.

            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-5">

              <Link
                to="/products"
                className="
                  px-8 py-4 rounded-2xl
                  bg-[#b8935f]
                  text-white
                  font-semibold
                  tracking-[2px]
                  hover:bg-[#a57f4c]
                  transition-all duration-300
                  shadow-lg
                "
              >
                KHÁM PHÁ NGAY
              </Link>

              {/* <Link
                to="/collections"
                className="
                  px-8 py-4 rounded-2xl
                  border border-[#d4b483]
                  text-white
                  tracking-[2px]
                  hover:bg-white
                  hover:text-[#1f1a14]
                  transition-all duration-300
                "
              >
                BỘ SƯU TẬP
              </Link> */}

            </div>

          </div>

        </div>

      </section>

      {/* NEW ARRIVALS */}
      <section className="relative py-24">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">

            <div>

              <div className="flex items-center gap-3 mb-4">

                <Sparkles
                  size={18}
                  className="text-[#b8935f]"
                />

                <p className="uppercase tracking-[5px] text-[#b8935f] text-sm">
                  New Arrivals
                </p>

              </div>

              <h2 className="text-4xl md:text-5xl font-semibold tracking-[4px] text-[#1f1a14] mb-4">
                SẢN PHẨM MỚI
              </h2>

              <p className="text-[#7b6753] text-lg">
                Những thiết kế mới nhất dành cho quý ông lịch lãm
              </p>

            </div>

            <Link
              to="/products?sort=newest"
              className="
                hidden md:flex items-center
                text-[#b8935f]
                hover:text-[#1f1a14]
                transition group
                tracking-[2px]
                font-medium
              "
            >
              XEM TẤT CẢ

              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />

            </Link>
          </div>

          {isLoading ? (renderSkeleton()) : newProducts.length === 0 ? (
            <div
              className="
                text-center py-20 rounded-3xl
                border border-[#e7dccb]
                bg-white text-[#8a7457]
                tracking-[2px]
              "
            >
              HIỆN TẠI CHƯA CÓ SẢN PHẨM NÀO
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

              {newProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

            </div>
          )}

        </div>

      </section>

      {/* COLLECTION BANNER */}
      {/* <section className="relative py-28 overflow-hidden">

       
        <div className="absolute inset-0">

          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2000&auto=format&fit=crop"
            alt="Collection"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-[#1f1a14]/70" />

        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">

          <p className="uppercase tracking-[6px] text-[#d4b483] text-sm mb-5">
            New Season
          </p>

          <h2 className="text-5xl md:text-7xl font-semibold text-white leading-tight mb-8">

            COMING SOON

          </h2>

          <p className="max-w-3xl mx-auto text-[#f3e6cf] text-lg md:text-xl leading-9 mb-12">

            Bộ sưu tập mới của OLDMAN đang được hoàn thiện —
            lấy cảm hứng từ phong cách quý ông châu Âu hiện đại,
            tối giản nhưng đầy chiều sâu.

          </p>

          <Link
            to="/collections"
            className="
              inline-flex items-center
              px-10 py-4 rounded-2xl
              bg-[#b8935f]
              text-white
              tracking-[3px]
              font-semibold
              hover:bg-[#a57f4c]
              transition-all duration-300
            "
          >
            KHÁM PHÁ SỚM
          </Link>

        </div>

      </section> */}

      {/* BEST SELLERS */}
      <section className="relative py-24 bg-[#f5efe6]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">

            <div>

              <div className="flex items-center gap-3 mb-4">

                <Flame
                  size={18}
                  className="text-[#b8935f]"
                />

                <p className="uppercase tracking-[5px] text-[#b8935f] text-sm">
                  Best Sellers
                </p>

              </div>

              <h2 className="text-4xl md:text-5xl font-semibold tracking-[4px] text-[#1f1a14] mb-4">
                BÁN CHẠY NHẤT
              </h2>

              <p className="text-[#7b6753] text-lg">
                Những sản phẩm được yêu thích nhiều nhất
              </p>

            </div>

            <Link
              to="/products?sort=best-selling"
              className="
                hidden md:flex items-center
                text-[#b8935f]
                hover:text-[#1f1a14]
                transition group
                tracking-[2px]
                font-medium
              "
            >
              XEM TẤT CẢ

              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />

            </Link>

          </div>

          {isLoading ? (
            renderSkeleton()
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

              {bestSellerProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

            </div>
          )}

        </div>

      </section>

      {/* FEATURE */}
      <section className="relative py-24 border-t border-[#e5d8c5]">

        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(184,147,95,0.08),transparent_60%)]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          <div className="flex justify-center mb-5">

            <div className="w-14 h-14 rounded-full bg-[#b8935f]/10 flex items-center justify-center">

              <ShieldCheck
                size={28}
                className="text-[#b8935f]"
              />

            </div>

          </div>

          <p className="uppercase tracking-[5px] text-[#b8935f] text-sm mb-5">
            Exclusive Offer
          </p>

          <h2 className="text-4xl md:text-6xl font-semibold text-[#1f1a14] mb-6 leading-tight">

            Ưu Đãi Dành Cho
            <br />
            Thành Viên Mới

          </h2>

          <p className="text-xl text-[#6f5a43] leading-8 max-w-2xl mx-auto mb-10">

            Nhận ngay ưu đãi đặc biệt cho đơn hàng đầu tiên
            và trở thành thành viên của OLDMAN.

          </p>

          <Link
            to="/register"
            className="
              inline-flex items-center
              px-10 py-4 rounded-2xl
              bg-[#b8935f]
              text-white
              font-semibold
              tracking-[2px]
              hover:bg-[#a57f4c]
              transition-all duration-300
              shadow-lg
            "
          >
            ĐĂNG KÝ THÀNH VIÊN
          </Link>

        </div>

      </section>

    </div>
  );
}