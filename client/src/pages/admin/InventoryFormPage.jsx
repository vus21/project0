import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, X, Plus, RotateCcw, Save } from 'lucide-react';
import { productApi } from '../../api/productApi';

export default function InventoryFormPage({ product, open, onClose, onSuccess }) {
  const [variants, setVariants] = useState([]);
  const [deltas, setDeltas] = useState([]);
  const [actives, setActives] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Fetch product khi mở modal ───────────────────────────────────────────
  useEffect(() => {
    if (!open || !product?._id) return;
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const data = product;
        const v = data?.variants ?? [];
        setVariants(v);
        setDeltas(v.map(() => 0));
        setActives(v.map((x) => x.isActive));
      } catch {
        toast.error('Không thể tải dữ liệu sản phẩm');
        onClose();
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [open, product?._id]);

  if (!open) return null;

  // ─── Computed ─────────────────────────────────────────────────────────────
  const totalCurrent = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
  const totalAfter = variants.reduce((s, v, i) => s + Math.max(0, (v.stock ?? 0) + deltas[i]), 0);
  const totalDelta = totalAfter - totalCurrent;
  const dirtyCount =
    deltas.filter((d) => d !== 0).length +
    actives.filter((a, i) => a !== variants[i]?.isActive).length;

  // ─── Handlers: variant cũ ─────────────────────────────────────────────────
  const setDelta = (i, raw) => {
    const n = Math.max(-(variants[i]?.stock ?? 0), parseInt(raw) || 0);
    setDeltas((prev) => prev.map((d, idx) => (idx === i ? n : d)));
  };
  const adjDelta = (i, by) => setDelta(i, deltas[i] + by);
  const setActive = (i, val) =>
    setActives((prev) => prev.map((a, idx) => (idx === i ? val : a)));

  const handleReset = () => {
    setDeltas(variants.map(() => 0));
    setActives(variants.map((v) => v.isActive));
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const calls = [];
      variants.forEach((v, i) => {
        if (deltas[i] === 0 && actives[i] === v.isActive) return;
        calls.push(
          productApi
            .manageVariant(product._id, 'update', {
              sku: v.sku,
              color: v.color,
              size: v.size,
              image: v.image ?? '',
              stock: Math.max(0, (v.stock ?? 0) + deltas[i]),
              isActive: actives[i],
            })
            .catch(() => {
              throw new Error(`Cập nhật SKU ${v.sku} thất bại`);
            })
        );
      });

      await Promise.all(calls);
      toast.success('Lưu tồn kho thành công');
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu tồn kho');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Helpers UI ───────────────────────────────────────────────────────────
  const stockColor = (n) => {
    if (n === 0) return 'text-red-500';
    if (n < 10) return 'text-amber-500';
    return 'text-green-600';
  };
  const deltaStyle = (d) => {
    if (d > 0) return 'bg-green-100 text-green-700';
    if (d < 0) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-500';
  };
  const deltaLabel = (d) => (d > 0 ? `+${d}` : d === 0 ? '—' : `${d}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
            {product?.images?.[0]?.url
              ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
              : <span className="text-lg">📦</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{product?.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {variants.length} variants · Tổng tồn kho: {totalCurrent}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {isFetching ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tồn kho hiện tại', value: totalCurrent, cls: 'text-gray-900' },
                  { label: 'Sau khi lưu', value: totalAfter, cls: stockColor(totalAfter) },
                  {
                    label: 'Thay đổi',
                    value: (totalDelta >= 0 ? '+' : '') + totalDelta,
                    cls: totalDelta > 0 ? 'text-green-600' : totalDelta < 0 ? 'text-red-500' : 'text-gray-400',
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Bảng variants hiện có */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Variants hiện có
                </p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['SKU', 'Màu', 'Size', 'Hiện tại', 'Thêm / bớt', 'Sau lưu', 'Hiển thị'].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 py-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, i) => {
                        const after = Math.max(0, (v.stock ?? 0) + deltas[i]);
                        return (
                          <tr key={v.sku} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="px-3 py-2.5">
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">{v.sku}</code>
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{v.color}</td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{v.size}</td>
                            <td className="px-3 py-2.5 font-semibold text-gray-800">{v.stock ?? 0}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => adjDelta(i, -1)}
                                  className="w-6 h-6 border border-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                                >
                                  <span className="text-base leading-none">−</span>
                                </button>
                                <input
                                  type="number"
                                  value={deltas[i]}
                                  onChange={(e) => setDelta(i, e.target.value)}
                                  className={`w-14 h-7 text-center text-xs border rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors ${deltas[i] !== 0
                                      ? 'border-green-400 bg-green-50 text-green-700'
                                      : 'border-gray-200 bg-white text-gray-700'
                                    }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => adjDelta(i, 1)}
                                  className="w-6 h-6 border border-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`font-semibold ${stockColor(after)}`}>{after}</span>
                              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${deltaStyle(deltas[i])}`}>
                                {deltaLabel(deltas[i])}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <button
                                type="button"
                                onClick={() => setActive(i, !actives[i])}
                                className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${actives[i] ? 'bg-primary-600' : 'bg-gray-200'
                                  }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${actives[i] ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {variants.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-400">
                            Chưa có variant nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>

          {dirtyCount > 0 && (
            <p className="flex-1 text-xs text-gray-400">{dirtyCount} thay đổi chưa lưu</p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || dirtyCount === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving
              ? <><Loader2 className="animate-spin" size={15} /> Đang lưu...</>
              : <><Save size={15} /> Lưu tất cả</>}
          </button>
        </div>

      </div>
    </div>
  );
}