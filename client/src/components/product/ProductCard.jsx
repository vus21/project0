import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { name, images, basePrice, discountPrice, slug, totalStock } = product;
  const image =
    images?.[0]?.url ||
    'https://via.placeholder.com/600x800/f8f5ef/7b6753?text=OLDMAN';

  const isDiscounted =
    discountPrice && discountPrice < basePrice;

  const finalPrice = discountPrice || basePrice;

  return (
    <div
      className="
        group
        bg-white
        rounded-2xl
        border border-[#e7dccb]
        overflow-hidden
        transition-all duration-500
        hover:-translate-y-1
        hover:shadow-[0_18px_40px_rgba(31,26,20,0.08)]
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5efe6]">
        <Link to={`/products/${slug}`}
        state={{product}}>
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="
              w-full h-full object-cover
              transition-transform duration-700
              group-hover:scale-[1.03]
            "
          />
        </Link>

        {/* Overlay */}
        <span>kkkkkkkkkkk</span>
        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black/10 via-transparent to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500
          "
        />

        {/* Discount */}
        {isDiscounted && (
          <div
            className="
              absolute top-4 left-4
              px-3 py-1.5
              rounded-full
              bg-[#b8935f]
              text-white
              text-[10px]
              tracking-[0.18em]
              uppercase
              font-medium
              shadow-sm
            "
          >
            -
            {Math.round(
              (1 - discountPrice / basePrice) * 100
            )}
            %
          </div>
        )}

        {/* Out of stock */}
        {totalStock === 0 && (
          <div
            className="
              absolute top-4 left-4
              px-3 py-1.5
              rounded-full
              bg-[#3f372f]
              text-[#f8f5ef]
              text-[10px]
              tracking-[0.18em]
              uppercase
              font-medium
            "
          >
            Hết hàng
          </div>
        )}

        {/* Wishlist */}
        <button
          className="
            absolute bottom-4 right-4
            w-10 h-10
            flex items-center justify-center
            rounded-full
            border border-[#e7dccb]
            bg-white/90
            backdrop-blur-md
            text-[#7b6753]
            opacity-0
            translate-y-2
            group-hover:opacity-100
            group-hover:translate-y-0
            hover:bg-[#b8935f]
            hover:text-white
            hover:border-[#b8935f]
            transition-all duration-500
          "
        >
          <Heart size={17} strokeWidth={1.8} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-3">
        {/* Product name */}
        <Link to={`/products/${slug}`}>
          <h3
            className="
              text-[15px]
              font-medium
              tracking-[0.04em]
              text-[#1f1a14]
              line-clamp-1
              transition-colors duration-300
              hover:text-[#b8935f]
            "
          >
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-end gap-3">
          <span
            className="
              text-[18px]
              font-semibold
              tracking-[0.02em]
              text-[#1f1a14]
            "
          >
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(finalPrice)}
          </span>

          {isDiscounted && (
            <span
              className="
                text-sm
                text-[#a08b74]
                line-through
              "
            >
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(basePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}