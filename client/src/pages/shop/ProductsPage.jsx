import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import ProductCard from '../../components/product/ProductCard';

const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'Sản phẩm mới nhất' },
  { value: 'sold_desc', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
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
    <div className="bg-white rounded-2xl border border-[#e7dccb] overflow-hidden animate-pulse">
      <div className="h-80 bg-[#f5efe6]" />
      <div className="p-4 pb-5 px-5">
        <div className="h-3 bg-[#f5efe6] rounded-md w-2/5 mb-2.5" />
        <div className="h-4 bg-[#f5efe6] rounded-md w-4/5 mb-3.5" />
        <div className="h-5 bg-[#f5efe6] rounded-md w-1/2" />
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
  const limit = 16;

  // Categories fetched from API (only root categories, each with its children for the hover menu)
  const [categories, setCategories] = useState([]);
  const [openCatSlug, setOpenCatSlug] = useState(null); // slug of root category whose children dropdown is open

  const sort = searchParams.get('sort') || 'updatedAt_desc';
  const category = searchParams.get('category') || '';
  const priceRangeIdx = parseInt(searchParams.get('priceRange') || '0', 10);
  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [sortOpen, setSortOpen] = useState(false);

  const selectedPriceRange = PRICE_RANGES[priceRangeIdx] || PRICE_RANGES[0];

  // Keep the search input in sync if the URL changes from elsewhere (e.g. "Xoá bộ lọc")
  useEffect(() => { setSearchInput(search); }, [search]);

  // Fetch root categories (parent_id === null) with their children for the dropdown menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        const all = res?.data || [];
        const roots = all
          .filter(c => c.parent_id === null && c.isActive !== false)
          .map(c => ({
            label: c.name,
            value: c.slug,
            children: (c.children || []).filter(ch => ch.isActive !== false),
          }));
        setCategories(roots);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        sort,
        limit,
        page,
        ...(category && { category }),
        ...(search && { q:search }),
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

  // Select a category (root or child slug). Clicking the same category again clears the filter.
  const handleSelectCategory = (slug) => {
    updateParam('category', category === slug ? '' : slug);
    setOpenCatSlug(null);
  };

  const handleSearch = e => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const totalPages = Math.ceil(total / limit);

  const selectedSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sắp xếp';

  // Display label for the currently selected category (root or child)
  const selectedCategoryLabel = (() => {
    if (!category) return 'Bộ sưu tập';
    for (const root of categories) {
      if (root.value === category) return root.label;
      const child = root.children.find(ch => ch.slug === category);
      if (child) return child.name;
    }
    return 'Sản phẩm';
  })();

  return (
    <div className="min-h-screen bg-[#f8f5ef] font-serif">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .product-grid { animation: fadeIn 0.45s ease forwards; }
        select { appearance: none; -webkit-appearance: none; }
      `}</style>

      {/* Page header */}
      <div className="border-b border-[#e7dccb] bg-[#f8f5ef] pt-7">
        <div className="max-w-7xl mx-auto px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-[11px] tracking-[0.12em] uppercase text-[#9b8570]">
            <Link to="/" className="text-[#9b8570] no-underline hover:text-[#b8935f]">Trang chủ</Link>
            <span>/</span>
            <span className="text-[#1f1a14]">Sản phẩm</span>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-4 pb-5">
            <div>
              <h1 className="m-0 text-3xl font-normal text-[#1f1a14] tracking-[0.04em] leading-tight">
                {selectedCategoryLabel}
              </h1>
              <p className="mt-1.5 mb-0 text-[13px] text-[#7b6753] tracking-[0.06em]">
                {isLoading ? '...' : `${total} sản phẩm`}
              </p>
            </div>

            {/* Search + sort row */}
            <div className="flex gap-3 items-center">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-[220px] h-10 pl-4 pr-10 border border-[#e7dccb] rounded-lg bg-white text-[#1f1a14] text-[13px] tracking-[0.03em] outline-none transition-colors focus:border-[#b8935f]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); updateParam('search', ''); }}
                    className="absolute right-9 top-0 h-full w-7 bg-transparent border-none cursor-pointer text-[#9b8570] flex items-center justify-center hover:text-[#b8935f]"
                    aria-label="Xoá tìm kiếm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
                <button type="submit" className="absolute right-0 top-0 h-full w-10 bg-transparent border-none cursor-pointer text-[#7b6753] flex items-center justify-center hover:text-[#b8935f]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              </form>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(o => !o)}
                  className="h-10 px-4 flex items-center gap-2 border border-[#e7dccb] rounded-lg bg-white text-[#1f1a14] text-[13px] cursor-pointer tracking-[0.03em] whitespace-nowrap"
                >
                  {selectedSortLabel}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-[46px] z-50 bg-white border border-[#e7dccb] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] min-w-[210px] overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => { updateParam('sort', opt.value); setSortOpen(false); }}
                          className={`px-[18px] py-[11px] text-[13px] cursor-pointer tracking-[0.03em] flex items-center justify-between transition-colors duration-150 hover:bg-[#f5efe6] hover:text-[#b8935f] ${
                            sort === opt.value ? 'text-[#b8935f] font-semibold bg-[#faf6f0]' : 'text-[#5e4a36] font-normal bg-transparent'
                          }`}
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
          <div className="flex gap-0  overflow-y-visible border-t border-[#e7dccb]">
            {/* "Tất cả" tab */}
            <button
              onClick={() => updateParam('category', '')}
              className={`px-[22px] py-3.5 border-none bg-transparent cursor-pointer text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-200 border-b-2 hover:text-[#b8935f] ${
                category === '' ? 'font-semibold text-[#b8935f] border-[#b8935f]' : 'font-normal text-[#7b6753] border-transparent'
              }`}
            >
              Tất cả
            </button>

            {categories.map(cat => {
              // Active if this root category itself is selected, or one of its children is selected
              const active = category === cat.value || cat.children.some(ch => ch.slug === category);
              const hasChildren = cat.children.length > 0;
              return (
                <div
                  key={cat.value}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenCatSlug(cat.value)}
                  onMouseLeave={() => setOpenCatSlug(prev => (prev === cat.value ? null : prev))}
                >
                  <button
                    onClick={() => handleSelectCategory(cat.value)}
                    className={`px-[22px] py-3.5 border-none bg-transparent cursor-pointer text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-200 border-b-2 flex items-center gap-1 hover:text-[#b8935f] ${
                      active ? 'font-semibold text-[#b8935f] border-[#b8935f]' : 'font-normal text-[#7b6753] border-transparent'
                    }`}
                  >
                    {cat.label}
                    {hasChildren && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={`transition-transform duration-200 ${openCatSlug === cat.value ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </button>

                  {/* Hover dropdown: child categories */}
                  {hasChildren && openCatSlug === cat.value && (
                    <div className="absolute left-0 top-full z-50 bg-white border border-[#e7dccb] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] min-w-[180px] overflow-hidden">
                      {cat.children.map(child => (
                        <div
                          key={child.slug}
                          onClick={() => handleSelectCategory(child.slug)}
                          className={`px-[18px] py-[11px] text-xs tracking-[0.08em] uppercase cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-[#f5efe6] hover:text-[#b8935f] ${
                            category === child.slug ? 'text-[#b8935f] font-semibold bg-[#faf6f0]' : 'text-[#5e4a36] font-normal bg-transparent'
                          }`}
                        >
                          {child.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-8 pb-16 flex gap-9">

        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0">
          <div className="bg-white border border-[#e7dccb] rounded-[14px] overflow-hidden">
            <div className="px-5 py-[18px] border-b border-[#e7dccb]">
              <p className="m-0 text-[11px] tracking-[0.14em] uppercase font-semibold text-[#9b8570]">
                Khoảng giá
              </p>
            </div>
            <div className="py-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('priceRange', i > 0 ? String(i) : '')}
                  className={`w-full px-5 py-2.5 text-left border-none text-[13px] cursor-pointer tracking-[0.02em] transition-all duration-200 border-l-2 hover:bg-[#f5efe6] ${
                    priceRangeIdx === i
                      ? 'bg-[#faf6f0] text-[#b8935f] font-semibold border-[#b8935f]'
                      : 'bg-transparent text-[#5e4a36] font-normal border-transparent'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters badge */}
          {(category || priceRangeIdx > 0 || search) && (
            <div className="mt-4">
              <button
                onClick={() => { setSearchInput(''); setSearchParams({}); setPage(1); }}
                className="w-full p-2.5 border border-[#e7dccb] rounded-lg bg-white cursor-pointer text-[#7b6753] text-xs tracking-[0.08em] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 hover:border-[#b8935f] hover:text-[#b8935f]"
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
        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 px-5 text-[#9b8570]">
              <div className="text-5xl mb-4 opacity-30">◇</div>
              <p className="text-lg tracking-[0.06em] mb-2 text-[#5e4a36]">
                Không tìm thấy sản phẩm
              </p>
              <p className="text-[13px] m-0">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            </div>
          ) : (
            <>
              <div className="product-grid grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`w-9 h-9 border border-[#e7dccb] rounded-lg bg-white flex items-center justify-center transition-all duration-200 ${
                      page === 1 ? 'cursor-not-allowed text-[#c8b9a8]' : 'cursor-pointer text-[#5e4a36]'
                    }`}
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
                      <span key={`dots-${i}`} className="text-[#9b8570] px-1 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-[13px] cursor-pointer transition-all duration-200 border hover:bg-[#b8935f] hover:text-white hover:border-[#b8935f] ${
                          page === p
                            ? 'bg-[#b8935f] text-white border-[#b8935f] font-semibold'
                            : 'bg-white text-[#5e4a36] border-[#e7dccb] font-normal'
                        }`}
                      >
                        {p}
                      </button>
                    ))
                  }
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`w-9 h-9 border border-[#e7dccb] rounded-lg bg-white flex items-center justify-center transition-all duration-200 ${
                      page === totalPages ? 'cursor-not-allowed text-[#c8b9a8]' : 'cursor-pointer text-[#5e4a36]'
                    }`}
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