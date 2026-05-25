import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';

const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'Sản phẩm mới nhất' },
  { value: 'sold_desc', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
];

const CATEGORIES = [
  { label: 'Tất cả', value: '' },
  { label: 'Sản phẩm mới', value: 'san-pham-moi' },
  { label: 'Danh mục sale', value: 'danh-muc-sale' },
  { label: 'Áo nam', value: 'ao-nam' },
  { label: 'Quần nam', value: 'quan-nam' },
  { label: 'Phụ kiện', value: 'phu-kien' },
];

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: 0, max: Infinity },
  { label: 'Dưới 300.000đ', min: 0, max: 300000 },
  { label: '300.000đ – 600.000đ', min: 300000, max: 600000 },
  { label: '600.000đ – 1.000.000đ', min: 600000, max: 1000000 },
  { label: 'Trên 1.000.000đ', min: 1000000, max: Infinity },
];

function ProductCardSkeleton() {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e7dccb',
      overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 320, background: '#f5efe6' }} />
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ height: 12, background: '#f5efe6', borderRadius: 6, width: '40%', marginBottom: 10 }} />
        <div style={{ height: 16, background: '#f5efe6', borderRadius: 6, width: '80%', marginBottom: 14 }} />
        <div style={{ height: 20, background: '#f5efe6', borderRadius: 6, width: '50%' }} />
      </div>
    </div>
  );
}


export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 12;

  const sort = searchParams.get('sort') || 'updatedAt_desc';
  const category = searchParams.get('category') || '';
  const priceRangeIdx = parseInt(searchParams.get('priceRange') || '0', 10);
  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedPriceRange = PRICE_RANGES[priceRangeIdx] || PRICE_RANGES[0];

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        sort,
        limit,
        page,
        ...(category && { category }),
        ...(search && { search }),
        ...(selectedPriceRange.min > 0 && { minPrice: selectedPriceRange.min }),
        ...(selectedPriceRange.max !== Infinity && { maxPrice: selectedPriceRange.max }),
      };
      const res = await productApi.getAll(params);
      setProducts(res?.data || []);
      setTotal(res?.total || res?.data?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sort, category, priceRangeIdx, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setPage(1);
    setSearchParams(next);
  };

  const handleSearch = e => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const totalPages = Math.ceil(total / limit);

  const selectedSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sắp xếp';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f5ef',
      fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .product-grid { animation: fadeIn 0.45s ease forwards; }
        .filter-btn:hover { background: #f5efe6 !important; }
        .page-btn:hover { background: #b8935f !important; color: #fff !important; }
        select { appearance: none; -webkit-appearance: none; }
        input[type=text], input[type=search] { outline: none; }
        input[type=text]:focus, input[type=search]:focus { border-color: #b8935f !important; }
        .cat-item { transition: all 0.2s; cursor: pointer; }
        .cat-item:hover { color: #b8935f !important; }
        .sort-option:hover { background: #f5efe6; color: #b8935f; }
        .overlay { position:fixed;inset:0;z-index:40;background:rgba(31,26,20,0.35);backdrop-filter:blur(2px); }
      `}</style>

      {/* Page header */}
      <div style={{
        borderBottom: '1px solid #e7dccb',
        background: '#f8f5ef',
        padding: '28px 0 0',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          {/* Breadcrumb */}
          <div style={{
            fontSize: 11, letterSpacing: '0.12em', color: '#9b8570',
            textTransform: 'uppercase', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Link to="/" style={{ color: '#9b8570', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: '#1f1a14' }}>Sản phẩm</span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
            paddingBottom: 20,
          }}>
            <div>
              <h1 style={{
                fontSize: 32, fontWeight: 400, color: '#1f1a14',
                margin: 0, letterSpacing: '0.04em', lineHeight: 1.2,
                fontFamily: '"Cormorant Garamond", serif',
              }}>
                {category
                  ? CATEGORIES.find(c => c.value === category)?.label || 'Sản phẩm' : 'Bộ sưu tập'}
              </h1>
              <p style={{
                margin: '6px 0 0', fontSize: 13, color: '#7b6753',
                letterSpacing: '0.06em', fontFamily: '"Cormorant Garamond", serif',
              }}>
                {isLoading ? '...' : `${total} sản phẩm`}
              </p>
            </div>

            {/* Search + sort row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                
              <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  style={{
                    width: 220, height: 40, padding: '0 40px 0 16px',
                    border: '1px solid #e7dccb', borderRadius: 8,
                    background: '#ffffff', color: '#1f1a14', fontSize: 13,
                    fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.03em',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button type="submit" style={{
                  position: 'absolute', right: 0, top: 0, height: '100%',
                  width: 40, background: 'none', border: 'none', cursor: 'pointer',
                  color: '#7b6753', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              </form>

              {/* Sort dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setSortOpen(o => !o)}
                  style={{
                    height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8,
                    border: '1px solid #e7dccb', borderRadius: 8, background: '#fff',
                    color: '#1f1a14', fontSize: 13, cursor: 'pointer',
                    fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedSortLabel}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {sortOpen && (
                  <>
                    <div className="overlay" style={{ background: 'transparent', backdropFilter: 'none' }} onClick={() => setSortOpen(false)} />
                    <div style={{
                      position: 'absolute', right: 0, top: 46, zIndex: 50,
                      background: '#fff', border: '1px solid #e7dccb', borderRadius: 10,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 210, overflow: 'hidden',
                    }}>
                      {SORT_OPTIONS.map(opt => (
                        <div
                          key={opt.value}
                          className="sort-option"
                          onClick={() => { updateParam('sort', opt.value); setSortOpen(false); }}
                          style={{
                            padding: '11px 18px', fontSize: 13, cursor: 'pointer',
                            color: sort === opt.value ? '#b8935f' : '#5e4a36',
                            fontWeight: sort === opt.value ? 600 : 400,
                            fontFamily: '"Cormorant Garamond", serif',
                            letterSpacing: '0.03em',
                            background: sort === opt.value ? '#faf6f0' : 'transparent',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                        >
                          {opt.label}
                          {sort === opt.value && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8935f" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div style={{
            display: 'flex', gap: 0, overflowX: 'auto',
            borderTop: '1px solid #e7dccb',
          }}>
            {CATEGORIES.map(cat => {
              const active = category === cat.value;
              return (
                <button
                  key={cat.value}
                  className="cat-item"
                  onClick={() => updateParam('category', cat.value)}
                  style={{
                    padding: '14px 22px',
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: '"Cormorant Garamond", serif', fontWeight: active ? 600 : 400,
                    color: active ? '#b8935f' : '#7b6753',
                    borderBottom: active ? '2px solid #b8935f' : '2px solid transparent',
                    whiteSpace: 'nowrap', transition: 'all 0.2s',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 64px', display: 'flex', gap: 36 }}>

        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{
            background: '#fff', border: '1px solid #e7dccb', borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e7dccb' }}>
              <p style={{
                margin: 0, fontSize: 11, letterSpacing: '0.14em', color: '#9b8570',
                textTransform: 'uppercase', fontFamily: '"Cormorant Garamond", serif', fontWeight: 600,
              }}>
                Khoảng giá
              </p>
            </div>
            <div style={{ padding: '8px 0' }}>
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('priceRange', i > 0 ? String(i) : '')}
                  className="filter-btn"
                  style={{
                    width: '100%', padding: '10px 20px', textAlign: 'left',
                    border: 'none', background: priceRangeIdx === i ? '#faf6f0' : 'transparent',
                    color: priceRangeIdx === i ? '#b8935f' : '#5e4a36',
                    fontSize: 13, cursor: 'pointer', fontWeight: priceRangeIdx === i ? 600 : 400,
                    fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.02em',
                    borderLeft: priceRangeIdx === i ? '2px solid #b8935f' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters badge */}
          {(category || priceRangeIdx > 0 || search) && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => { setSearchInput(''); setSearchParams({}); setPage(1); }}
                style={{
                  width: '100%', padding: '10px', border: '1px solid #e7dccb',
                  borderRadius: 8, background: '#fff', cursor: 'pointer',
                  color: '#7b6753', fontSize: 12, letterSpacing: '0.08em',
                  fontFamily: '"Cormorant Garamond", serif', textTransform: 'uppercase',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8935f'; e.currentTarget.style.color = '#b8935f'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7dccb'; e.currentTarget.style.color = '#7b6753'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Xoá bộ lọc
              </button>
            </div>
          )}
        </aside>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 24,
            }}>
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              color: '#9b8570', fontFamily: '"Cormorant Garamond", serif',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◇</div>
              <p style={{ fontSize: 18, letterSpacing: '0.06em', margin: '0 0 8px', color: '#5e4a36' }}>
                Không tìm thấy sản phẩm
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            </div>
          ) : (
            <>
              <div
                className="product-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 24,
                }}
              >
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  marginTop: 48, display: 'flex', justifyContent: 'center',
                  alignItems: 'center', gap: 6,
                }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      width: 36, height: 36, border: '1px solid #e7dccb', borderRadius: 8,
                      background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                      color: page === 1 ? '#c8b9a8' : '#5e4a36',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === '...' ? (
                      <span key={`dots-${i}`} style={{ color: '#9b8570', padding: '0 4px', fontSize: 14 }}>…</span>
                    ) : (
                      <button
                        key={p}
                        className="page-btn"
                        onClick={() => setPage(p)}
                        style={{
                          width: 36, height: 36, border: `1px solid ${page === p ? '#b8935f' : '#e7dccb'}`,
                          borderRadius: 8,
                          background: page === p ? '#b8935f' : '#fff',
                          color: page === p ? '#fff' : '#5e4a36',
                          fontSize: 13, cursor: 'pointer', fontWeight: page === p ? 600 : 400,
                          fontFamily: '"Cormorant Garamond", serif',
                          transition: 'all 0.2s',
                        }}
                      >
                        {p}
                      </button>
                    ))
                  }
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      width: 36, height: 36, border: '1px solid #e7dccb', borderRadius: 8,
                      background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      color: page === totalPages ? '#c8b9a8' : '#5e4a36',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}