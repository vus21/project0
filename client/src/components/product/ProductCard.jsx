import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';


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
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: `1px solid ${hovered ? '#b8935f' : '#e7dccb'}`,
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 12px 40px rgba(184,147,95,0.13), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#f8f5ef', height: 300 }}>
          {pct && (
            <div style={{
              position: 'absolute', top: 14, left: 14, zIndex: 2,
              background: '#1f1a14', color: '#f8f5ef',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              padding: '4px 9px', borderRadius: 6,
              fontFamily: '"Cormorant Garamond", serif',
            }}>
              -{pct}%
            </div>
          )}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 5, zIndex: 2,
            }}>
              {images.slice(0, Math.min(images.length, 4)).map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.preventDefault(); setImgIdx(i); }}
                  style={{
                    width: i === imgIdx ? 18 : 6,
                    height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
                    background: i === imgIdx ? '#b8935f' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.25s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
          <img
            src={hovered && hoverImg ? hoverImg : mainImg}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.3s',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
            onError={e => { e.target.style.opacity = 0.3; }}
          />
        </div>

        {/* Info */}
        <div style={{ padding: '16px 18px 20px' }}>
          <p style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
            color: '#b8935f', textTransform: 'uppercase', margin: '0 0 6px',
            fontFamily: '"Cormorant Garamond", serif',
          }}>
            {product.category_id?.name || 'OLDMAN'}
          </p>
          <p style={{
            fontSize: 14, fontWeight: 500, color: '#1f1a14',
            margin: '0 0 12px', lineHeight: 1.45,
            fontFamily: '"Libre Baskerville", serif',
            letterSpacing: '0.01em',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontSize: 16, fontWeight: 600, color: '#b8935f',
              fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.02em',
            }}>
              {formatPrice(price)}
            </span>
            {originalPrice && (
              <span style={{
                fontSize: 12, color: '#b0a090',
                textDecoration: 'line-through',
                fontFamily: '"Cormorant Garamond", serif',
              }}>
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {product.totalStock === 0 && (
            <p style={{
              fontSize: 10, color: '#c0a080', marginTop: 6, letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: '"Cormorant Garamond", serif',
            }}>
              Hết hàng
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}