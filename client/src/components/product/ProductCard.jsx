import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { name, images, basePrice, discountPrice, slug, totalStock } = product;
  const image = images?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <Link to={`/products/${slug}`}>
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        </Link>
        {discountPrice < basePrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            - {Math.round((1 - discountPrice / basePrice) * 100)}%
          </div>
        )}
        {totalStock === 0 && (
          <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
            Hết hàng
          </div>
        )}
        <button className="absolute bottom-3 right-3 p-2 bg-white text-gray-500 rounded-full shadow hover:text-primary-600 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Heart size={18} />
        </button>
      </div>
      <div className="p-4">
        <Link to={`/products/${slug}`}>
          <h3 className="text-sm font-medium text-gray-900 truncate hover:text-primary-600 mb-1">{name}</h3>
        </Link>
        <div className="flex items-end space-x-2">
          <span className="text-lg font-bold text-red-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountPrice || basePrice)}
          </span>
          {discountPrice < basePrice && (
            <span className="text-sm text-gray-400 line-through mb-0.5">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
