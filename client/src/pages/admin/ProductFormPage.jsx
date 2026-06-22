import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Upload, X, Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  SEASONS, SEASON_LABELS,
  MATERIALS, MATERIAL_LABELS,
  PRODUCT_TAGS, PRODUCT_TAG_LABELS
} from '../../constants/products.js';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      isActive: true,
      tags: [],
      season: [],
      material: ''
    }
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  // Thêm state lưu các ảnh cũ bị người dùng xóa
  const [deletedImages, setDeletedImages] = useState([]);

  const [existingVariants, setExistingVariants] = useState([]);
  const [newVariants, setNewVariants] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [product_id, setProductId] = useState('');

  useEffect(() => {
    const initData = async () => {
      setIsFetching(true);
      let fetchedCategories = [];

      try {
        const res = await categoryApi.getAll();
        fetchedCategories = res?.data || [];
        setCategories(fetchedCategories);
      } catch (error) {
        setCategories([]);
      }

      if (isEdit) {
        try {
          const res = await productApi.getBySlug(id);
          const product = res?.data || {};

          setProductId(product._id);
          setValue('name', product.name || '');
          setValue('description', product.description || '');
          setValue('basePrice', product.basePrice || 0);
          setValue('discountPrice', product.discountPrice);

          const catId = typeof product.category_id === 'object' ? product.category_id?._id : product.category_id;
          setValue('category_id', catId || '');

          setValue('isActive', product.isActive);

          setValue('tags', product.tags || []);
          setValue('material', product.material || '');
          setValue('season', product.season || []);

          setExistingImages(product.images || []);
          setExistingVariants(product.variants || []);
        } catch (error) {
          toast.error('Không tìm thấy sản phẩm');
          navigate('/admin/products');
        } finally {
          setIsFetching(false);
        }
      } else {
        setIsFetching(false);
      }
    };

    initData();
  }, [id, isEdit, setValue, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previews]);
  };

  const removePreviewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Hàm xử lý xóa ảnh cũ đã tồn tại
  const removeExistingImage = (img, index) => {
    // Nếu ảnh có public_id hoặc _id từ DB, ta lưu lại để gửi lên API xóa
    const imgId = img.public_id || img._id || img.url;
    setDeletedImages(prev => [...prev, imgId]);

    // Loại bỏ khỏi danh sách hiển thị tạm thời trên giao diện
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addNewRow = () =>
    setNewVariants((prev) => [...prev, { sku: '', color: '', size: '', stock: 0 }]);

  const updateNew = (i, field, value) =>
    setNewVariants((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const removeNew = (i) =>
    setNewVariants((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('basePrice', data.basePrice);
      if (data.discountPrice) formData.append('discountPrice', data.discountPrice);
      formData.append('category_id', data.category_id);
      formData.append('isActive', data.isActive);

      if (data.material) formData.append('material', data.material);

      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => formData.append('tags', tag));
      }

      if (data.season && data.season.length > 0) {
        data.season.forEach(s => formData.append('season', s));
      }

      // Nạp danh sách các ảnh cũ bị xóa để backend nhận diện và xử lý xóa trên hosting/cloud
      if (deletedImages.length > 0) {
        deletedImages.forEach(imgId => formData.append('deletedImages', imgId));
      }

      images.forEach(img => {
        formData.append('images', img);
      });

      let currentProductId = product_id;

      if (isEdit) {
        await productApi.update(product_id, formData);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        const response = await productApi.create(formData);
        currentProductId = response?.data?._id || response?._id;
        toast.success('Thêm sản phẩm thành công');
      }

      if (currentProductId && newVariants.length > 0) {
        const variantCalls = newVariants
          .filter((r) => r.sku.trim())
          .map((r) =>
            productApi
              .manageVariant(currentProductId, 'add', { ...r, isActive: true })
              .catch(() => {
                throw new Error(`Thêm SKU ${r.sku} thất bại`);
              })
          );
        if (variantCalls.length > 0) {
          await Promise.all(variantCalls);
        }
      }

      navigate('/admin/products');
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4 mb-8">
        <Link to="/admin/products" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
            Thông tin cơ bản
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
              <input {...register('name', { required: 'Tên sản phẩm là bắt buộc' })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors" placeholder="Nhập tên sản phẩm..." />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                <select {...register('category_id', { required: 'Vui lòng chọn danh mục' })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chất liệu</label>
                <select {...register('material')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors">
                  <option value="">-- Chọn chất liệu --</option>
                  {Object.values(MATERIALS).map(val => (
                    <option key={val} value={val}>{MATERIAL_LABELS[val] || val}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
              <textarea {...register('description')} rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors" placeholder="Mô tả đặc điểm, chất liệu, hướng dẫn sử dụng..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá gốc (VND) <span className="text-red-500">*</span></label>
                <input type="number" {...register('basePrice', { required: true, min: 0 })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá khuyến mãi (VND)</label>
                <input type="number" {...register('discountPrice')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors" placeholder="Để trống nếu không giảm giá" />
              </div>
            </div>

            <div className="space-y-5 border-t border-gray-100 pt-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Mùa phù hợp</label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(SEASONS).map(val => (
                    <label key={val} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" value={val} {...register('season')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">
                        {val === 'all-season' ? SEASON_LABELS.allSeason : SEASON_LABELS[val] || val}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Thẻ (Tags)</label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(PRODUCT_TAGS).map(val => (
                    <label key={val} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" value={val} {...register('tags')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">{PRODUCT_TAG_LABELS[val] || val}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">Kích hoạt hiển thị sản phẩm này</label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
            Hình ảnh sản phẩm
          </h2>

          <div className="flex items-center justify-center w-full mb-6">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                  <Upload className="w-6 h-6 text-primary-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Click để tải ảnh lên <span className="font-normal text-gray-400">hoặc kéo thả vào đây</span></p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Tối đa 5MB)</p>
              </div>
              <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {/* Ảnh cũ hiện tại - Bổ sung thêm nút xóa khi hover */}
            {existingImages.map((img, idx) => (
              <div key={`existing-${idx}`} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square">
                <img src={img.url} className="w-full h-full object-cover" alt="Product" />
                <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-70 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-md group-hover:opacity-0 transition-opacity">Ảnh cũ</div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
                <button
                  type="button"
                  onClick={() => removeExistingImage(img, idx)}
                  className="absolute top-2 right-2 p-1.5 bg-white text-red-500 hover:bg-red-50 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                  title="Xóa ảnh cũ này"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Ảnh mới preview */}
            {previewImages.map((src, idx) => (
              <div key={`preview-${idx}`} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square">
                <img src={src} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
                <button type="button" onClick={() => removePreviewImage(idx)} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 hover:bg-red-50 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
            Quản lý biến thể sản phẩm
          </h2>

          {isEdit && existingVariants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Layers size={14} /> Biến thể hiện tại ({existingVariants.length})
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/40">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600">
                      <th className="px-4 py-2.5">SKU</th>
                      <th className="px-4 py-2.5">Màu</th>
                      <th className="px-4 py-2.5">Size</th>
                      <th className="px-4 py-2.5">Tồn kho</th>
                      <th className="px-4 py-2.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingVariants.map((v) => (
                      <tr key={v.sku} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2">
                          <code className="text-xs font-mono bg-gray-200/60 text-gray-700 px-1.5 py-0.5 rounded">{v.sku}</code>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600">{v.color || '—'}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">{v.size || '—'}</td>
                        <td className="px-4 py-2 text-xs font-semibold text-gray-800">{v.stock ?? 0}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {v.isActive ? 'Đang bán' : 'Ẩn'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Thêm variant mới {newVariants.length > 0 && `(${newVariants.length})`}
              </p>
              <button
                type="button"
                onClick={addNewRow}
                className="text-xs text-primary-600 border border-dashed border-primary-300 rounded-lg px-3 py-1.5 hover:bg-primary-50 flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Thêm dòng mới
              </button>
            </div>

            {newVariants.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['SKU *', 'Màu', 'Size', 'Số lượng', ''].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {newVariants.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 bg-primary-50/10">
                        <td className="px-3 py-2">
                          <input
                            value={r.sku}
                            onChange={(e) => updateNew(i, 'sku', e.target.value)}
                            placeholder="VD: APB-R-S"
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={r.color}
                            onChange={(e) => updateNew(i, 'color', e.target.value)}
                            placeholder="Đỏ"
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={r.size}
                            onChange={(e) => updateNew(i, 'size', e.target.value)}
                            placeholder="S"
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={0}
                            readOnly
                            className="w-24 px-3 py-2 text-xs text-center bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeNew(i)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              (!isEdit || existingVariants.length === 0) && (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <Sparkles className="mx-auto text-gray-300 mb-1" size={20} />
                  <p className="text-xs text-gray-400">Sản phẩm chưa có cấu hình kích cỡ hay màu sắc riêng biệt.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <Link to="/admin/products" className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Hủy bỏ
          </Link>
          <button type="submit" disabled={isLoading} className="flex items-center px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
            {isLoading && <Loader2 className="animate-spin mr-2" size={18} />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}