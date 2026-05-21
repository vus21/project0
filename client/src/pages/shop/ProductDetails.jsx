import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function ProductDetailPage() {
  const {state} = useLocation();
  const navigate = useNavigate();
  
  // Lấy dữ liệu product trực tiếp từ state truyền qua, không fetch từ API
  const product = state?.product;

  // Các States quản lý tương tác giao diện
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Khởi tạo thuộc tính (Màu & Size) mặc định dựa theo cấu trúc variants của Schema
  useEffect(() => {
    console.log('Product data on ProductDetailPage:', product);
    if (product?.variants && product.variants.length > 0) {
      // Tìm biến thể đầu tiên còn hàng và đang kích hoạt (isActive === true)
      const defaultVariant = product.variants.find(v => v.stock > 0 && v.isActive) || product.variants[0];
      if (defaultVariant) {
        setSelectedColor(defaultVariant.color);
        setSelectedSize(defaultVariant.size);
      }
    }
  }, [product]);

  // Fallback phòng trường hợp user reload trang làm mất state của React Router
  if (!product) {
    return (
      <div style={{ 
        minHeight: '100vh', background: '#f8f5ef', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif' 
      }}>
        <h2 style={{ color: '#1f1a14', fontSize: 20, marginBottom: 16, fontWeight: 400, letterSpacing: '0.04em' }}>
          Không tìm thấy thông tin sản phẩm
        </h2>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '12px 28px', background: '#b8935f', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 11
          }}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Trích xuất danh sách Màu sắc và Kích cỡ duy nhất từ Schema `product.variants`
  const availableColors = product.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : [];
  const availableSizes = product.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [];

  // Tìm thông tin chi tiết của variant đang được người dùng chọn
  const currentVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
  
  // Xác định trạng thái kho hàng (Nếu không có variants thì check totalStock của sản phẩm)
  const isOutOfStock = product.variants && product.variants.length > 0 
    ? (!currentVariant || currentVariant.stock === 0 || !currentVariant.isActive)
    : (product.totalStock === 0);

  // Hàm xử lý tăng giảm số lượng mua hàng
  const handleQuantityChange = (type) => {
    if (type === 'minus' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
    if (type === 'plus') {
      if (product.variants && product.variants.length > 0 && currentVariant) {
        if (quantity >= currentVariant.stock) {
          alert(`Sản phẩm này trong kho chỉ còn đúng ${currentVariant.stock} sản phẩm.`);
          return;
        }
      }
      setQuantity(prev => prev + 1);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f5ef',
      fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
      color: '#5e4a36',
      paddingBottom: 80,
    }}>
      {/* Cấu hình CSS Global cho các hiệu ứng tương tác tinh tế của OLDMAN */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Libre+Baskerville&display=swap');
        * { box-sizing: border-box; }
        
        .attr-btn {
          height: 40px;
          padding: 0 22px;
          border: 1px solid #e7dccb;
          background: #ffffff;
          color: #5e4a36;
          font-family: "Cormorant Garamond", serif;
          font-size: 13px;
          letter-spacing: 0.05em;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.25s cubic-bezier(.4,0,.2,1);
        }
        .attr-btn:hover:not(.disabled):not(.active) {
          border-color: #b8935f;
          color: #b8935f;
        }
        .attr-btn.active {
          border-color: #b8935f;
          background: #f5efe6;
          color: #1f1a14;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(184, 147, 95, 0.1);
        }
        .attr-btn.disabled {
          border: 1px dashed #e7dccb;
          color: #7b6753;
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .btn-primary {
          flex: 1; height: 50px; border: none; background: #b8935f; color: #ffffff;
          font-family: "Cormorant Garamond", serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer;
          border-radius: 12px; transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(184, 147, 95, 0.15);
        }
        .btn-primary:hover:not(:disabled) { background: #a57f4c; transform: translateY(-1px); }
        .btn-primary:disabled { background: #e7dccb; color: #7b6753; cursor: not-allowed; box-shadow: none; }

        .btn-secondary {
          flex: 1; height: 50px; border: 1px solid #b8935f; background: transparent; color: #6f5433;
          font-family: "Cormorant Garamond", serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer;
          border-radius: 12px; transition: all 0.3s ease;
        }
        .btn-secondary:hover:not(:disabled) { background: #b8935f; color: #ffffff; transform: translateY(-1px); }
        .btn-secondary:disabled { border-color: #e7dccb; color: #7b6753; cursor: not-allowed; }

        .action-banner {
          width: 100%; height: 46px; background: #1f1a14; color: #f8f5ef; border: none;
          font-family: "Cormorant Garamond", serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
          border-radius: 12px; transition: all 0.3s ease; margin-top: 20px;
        }
        .action-banner:hover { background: #b8935f; color: #ffffff; }
      `}</style>

      {/* Breadcrumb - Nhẹ nhàng, thanh lịch */}
      <div style={{ padding: '24px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7b6753' }}>
          <Link to="/" style={{ color: '#7b6753', textDecoration: 'none' }}>Trang chủ</Link>
          <span style={{ margin: '0 10px' }}>/</span>
          <span style={{ color: '#1f1a14' }}>{product.category_id?.name || 'Sản phẩm'}</span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 32px', display: 'flex', gap: '56px', flexWrap: 'wrap' }}>
        
        {/* Khối bên trái: Thư viện ảnh sản phẩm */}
        <div style={{ flex: '1 1 500px', maxWidth: 540 }}>
          {/* Ảnh chính lớn - Khung nền trắng chuẩn studio */}
          <div style={{ 
            background: '#ffffff', width: '100%', height: 560, borderRadius: '16px', overflow: 'hidden', 
            border: '1px solid #e7dccb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(31, 26, 20, 0.02)'
          }}>
            <img 
              src={product.images && product.images[selectedImageIdx] ? product.images[selectedImageIdx].url : 'https://via.placeholder.com/600x700?text=OLDMAN'} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* List ảnh nhỏ thumb lướt mượt */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {product.images.map((img, idx) => (
                <div 
                  key={img._id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  style={{
                    width: 80, height: 80, borderRadius: '8px', overflow: 'hidden',
                    border: idx === selectedImageIdx ? '1.5px solid #b8935f' : '1px solid #e7dccb',
                    cursor: 'pointer', padding: 3, background: '#ffffff', transition: 'all 0.2s'
                  }}
                >
                  <img src={img.url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khối bên phải: Bảng thông tin chi tiết */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Tên sản phẩm */}
          <h1 style={{ 
            fontSize: 32, fontWeight: 400, color: '#1f1a14', margin: '0 0 12px 0', 
            fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.02em', lineHeight: 1.25,
            textTransform: 'capitalize'
          }}>
            {product.name}
          </h1>

          {/* Trạng thái hàng hóa dựa theo Schema */}
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7b6753', marginBottom: 24 }}>
            <span>Trạng thái: 
              <span style={{ color: isOutOfStock ? '#d9534f' : '#b8935f', fontWeight: 600, marginLeft: 6 }}>
                {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
              </span>
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e7dccb', margin: '0 0 24px 0' }} />

          {/* Khu vực giá cả */}
          <div style={{ background: '#f5efe6', padding: '20px 24px', borderRadius: '16px', marginBottom: 28, border: '1px solid #e7dccb' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: '#b8935f', fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.02em' }}>
                {formatPrice(product.discountPrice || product.basePrice)}
              </span>
              {product.discountPrice < product.basePrice && (
                <span style={{ fontSize: 15, color: '#7b6753', textDecoration: 'line-through', fontFamily: '"Cormorant Garamond", serif' }}>
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Render Bộ chọn màu (Chỉ hiển thị nếu mảng variants có dữ liệu màu sắc) */}
          {availableColors.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7b6753', display: 'block', marginBottom: 10 }}>
                Màu sắc: <strong style={{ color: '#1f1a14', marginLeft: 4, textTransform: 'none', fontFamily: 'sans-serif', fontSize: 13 }}>{selectedColor}</strong>
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {availableColors.map(color => (
                  <button 
                    key={color} 
                    className={`attr-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => { setSelectedColor(color); setQuantity(1); }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Bộ chọn size (Tự động disable tổ hợp hết hàng) */}
          {availableSizes.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7b6753', display: 'block', marginBottom: 10 }}>
                Kích thước:
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {availableSizes.map(size => {
                  const matchVariant = product.variants?.find(v => v.color === selectedColor && v.size === size);
                  const disabled = !matchVariant || matchVariant.stock === 0 || !matchVariant.isActive;

                  return (
                    <button 
                      key={size} 
                      className={`attr-btn ${selectedSize === size ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                      disabled={disabled}
                      onClick={() => { setSelectedSize(size); setQuantity(1); }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bộ tăng giảm số lượng */}
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7b6753', display: 'block', marginBottom: 10 }}>
              Số lượng:
            </span>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', background: '#ffffff', 
              border: '1px solid #e7dccb', borderRadius: '8px', padding: '2px'
            }}>
              <button 
                onClick={() => handleQuantityChange('minus')}
                style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: '#1f1a14', fontSize: 16 }}
              >-</button>
              <div style={{ width: 44, textAlign: 'center', fontSize: 14, color: '#1f1a14', fontWeight: 500, fontFamily: 'sans-serif' }}>
                {quantity}
              </div>
              <button 
                onClick={() => handleQuantityChange('plus')}
                style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: '#1f1a14', fontSize: 16 }}
              >+</button>
            </div>
          </div>

          {/* Nhóm CTA Buttons */}
          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              className="btn-secondary"
              disabled={isOutOfStock}
              onClick={() => alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng.`)}
            >
              Thêm vào giỏ
            </button>
            
            <button 
              className="btn-primary"
              disabled={isOutOfStock}
              onClick={() => alert(`Tiến hành đặt mua ngay sản phẩm.`)}
            >
              Mua ngay
            </button>
          </div>

          {/* Nút hành động ưu đãi */}
          <button className="action-banner">
            Click vào đây để nhận ưu đãi hội viên OLDMAN
          </button>

          {/* Khối mô tả chi tiết sản phẩm */}
          {product.description && (
            <div style={{ marginTop: 40, borderTop: '1px solid #e7dccb', paddingTop: 24 }}>
              <h3 style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1f1a14', margin: '0 0 12px 0' }}>
                Mô tả sản phẩm
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#5e4a36', margin: 0, fontFamily: 'sans-serif' }}>
                {product.description}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}