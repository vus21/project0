import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { isActive: true }
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); 
  const [previewImages, setPreviewImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        // Fallback đảm bảo categories là mảng
        setCategories(res?.data || []);
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();

    
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await productApi.getBySlug(id);
          const product = res?.data || {};
          
          setValue('name', product.name || '');
          setValue('description', product.description || '');
          setValue('basePrice', product.basePrice || 0);
          setValue('discountPrice', product.discountPrice);
          setValue('category_id', product.category_id);
          setValue('isActive', product.isActive);
          setExistingImages(product.images || []);
        } catch (error) {
          toast.error('Không tìm thấy sản phẩm');
          navigate('/admin/products');
        } finally {
          setIsFetching(false);
        }
      };
      fetchProduct();
    }
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

      images.forEach(img => {
        formData.append('images', img);
      });

      if (isEdit) {
        await productApi.update(id, formData);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productApi.create(formData);
        toast.success('Thêm sản phẩm thành công');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;
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
            {existingImages.map((img, idx) => (
              <div key={`existing-${idx}`} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square">
                <img src={img.url} className="w-full h-full object-cover" alt="Product" />
                <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-md">Ảnh cũ</div>
              </div>
            ))}
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
