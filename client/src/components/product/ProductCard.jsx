import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function discountPercent(base, discount) {
  if (!base || !discount || base <= discount) return null;
  return Math.round(((base - discount) / base) * 100);
}

export default function ProductCard({ product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const images = product.images || [];
  const mainImg = images[imgIdx]?.url || images[0]?.url;
  const hoverImg = images[1]?.url;
  const pct = discountPercent(product.basePrice, product.discountPrice);
  const price = product.discountPrice || product.basePrice;
  const originalPrice = product.discountPrice ? product.basePrice : null;

  return (
    <Link
      to={`/products/${product.slug}`}
      state={{ product }}
      className="no-underline group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-white rounded-2xl border border-[#e7dccb] group-hover:border-[#b8935f] overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] translate-y-0 group-hover:-translate-y-1 shadow-[0_1px_4px_rgba(0,0,0,0.04)] group-hover:shadow-[0_12px_40px_rgba(184,147,95,0.13),0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#f8f5ef] h-[300px]">
          {pct && (
            <div className="absolute top-3.5 left-3.5 z-10 bg-[#1f1a14] text-[#f8f5ef] text-[11px] font-semibold tracking-[0.08em] py-1 px-[9px] rounded-[6px] font-['Cormorant_Garamond']">
              -{pct}%
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[5px] z-10">
              {images.slice(0, Math.min(images.length, 4)).map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.preventDefault(); setImgIdx(i); }}
                  className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-250 p-0 ${
                    i === imgIdx ? 'w-[18px] bg-[#b8935f]' : 'w-1.5 bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
          <img
            src={hovered && hoverImg ? hoverImg : mainImg}
            alt={product.name}
            className="w-full h-full object-cover transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] scale-100 group-hover:scale-[1.04]"
            onError={e => { e.target.classList.add('opacity-30'); }}
          />
        </div>

        {/* Info */}
        <div className="pt-4 px-[18px] pb-5">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#b8935f] uppercase mb-1.5 font-['Cormorant_Garamond']">
            {product.category_id?.name || 'OLDMAN'}
          </p>
          <p className="text-sm font-medium text-[#1f1a14] mb-3 leading-[1.45] font-['Libre_Baskerville'] tracking-[0.01em] line-clamp-2">
            {product.name}
          </p>
          
          {/* Price & Sold Container */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-[#b8935f] font-['Cormorant_Garamond'] tracking-[0.02em]">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <span className="text-xs text-[#b0a090] line-through font-['Cormorant_Garamond']">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            
            {/* Thông tin Đã bán */}
            {typeof product.sold === 'number' && (
              <span className="text-base font-semibold text-[#b8935f] font-['Cormorant_Garamond'] tracking-[0.02em]">
                Đã bán {product.sold}
              </span>
            )}
          </div>

          {product.totalStock === 0 && (
            <p className="text-[10px] text-[#c0a080] mt-1.5 tracking-[0.1em] uppercase font-['Cormorant_Garamond']">
              Hết hàng
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}