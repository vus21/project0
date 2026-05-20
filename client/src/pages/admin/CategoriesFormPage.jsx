import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'react-hot-toast';

import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  FolderTree
} from 'lucide-react';

export default function CategoriesFormPage() {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      isActive: true
    }
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();

        setCategories(res?.data || []);
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();

    if (isEdit) {
      const fetchCategory = async () => {
        try {
          const res = await categoryApi.getById(id);

          const category = res?.data || {};

          setValue('name', category.name || '');
          setValue('parent_id', category.parent_id?._id || '');
          setValue('isActive', category.isActive);

          setExistingImage(category.image || null);
        } catch (error) {
          toast.error('Không tìm thấy danh mục');
          navigate('/admin/categories');
        } finally {
          setIsFetching(false);
        }
      };

      fetchCategory();
    }
  }, [id, isEdit, navigate, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const removePreviewImage = () => {
    setImage(null);
    setPreviewImage(null);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append('name', data.name);

      if (data.parent_id) {
        formData.append('parent_id', data.parent_id);
      }

      formData.append('isActive', data.isActive);

      if (image) {
        formData.append('image', image);
      }

      if (isEdit) {
        await categoryApi.update(id, formData);

        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryApi.create(formData);

        toast.success('Thêm danh mục thành công');
      }

      navigate('/admin/categories');
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lưu danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2
          className="animate-spin text-primary-600"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to="/admin/categories"
          className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit
            ? 'Chỉnh Sửa Danh Mục'
            : 'Thêm Danh Mục Mới'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              1
            </span>

            Thông tin danh mục
          </h2>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên danh mục{' '}
                <span className="text-red-500">*</span>
              </label>

              <input
                {...register('name', {
                  required: 'Tên danh mục là bắt buộc'
                })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors"
                placeholder="Nhập tên danh mục..."
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Danh mục cha
              </label>

              <select
                {...register('parent_id')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors"
              >
                <option value="">
                  -- Không có danh mục cha --
                </option>

                {categories
                  .filter((c) => c._id !== id)
                  .map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Active */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />

              <label
                htmlFor="isActive"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Kích hoạt danh mục này
              </label>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              2
            </span>

            Hình ảnh danh mục
          </h2>

          {/* Upload */}
          <div className="flex items-center justify-center w-full mb-6">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                  <Upload className="w-6 h-6 text-primary-500" />
                </div>

                <p className="text-sm text-gray-600 font-medium">
                  Click để tải ảnh lên{' '}
                  <span className="font-normal text-gray-400">
                    hoặc kéo thả vào đây
                  </span>
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WEBP
                </p>
              </div>

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {/* Existing */}
            {existingImage?.url && !previewImage && (
              <div className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square">
                <img
                  src={existingImage.url}
                  className="w-full h-full object-cover"
                  alt="Category"
                />

                <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-md">
                  Ảnh cũ
                </div>
              </div>
            )}

            {/* Preview */}
            {previewImage && (
              <div className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square">
                <img
                  src={previewImage}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>

                <button
                  type="button"
                  onClick={removePreviewImage}
                  className="absolute top-2 right-2 p-1.5 bg-white text-red-500 hover:bg-red-50 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {!existingImage?.url && !previewImage && (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                <FolderTree size={40} className="mb-3" />

                <p className="text-sm">
                  Chưa có hình ảnh nào
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <Link
            to="/admin/categories"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading && (
              <Loader2
                className="animate-spin mr-2"
                size={18}
              />
            )}

            {isEdit
              ? 'Lưu thay đổi'
              : 'Tạo danh mục'}
          </button>
        </div>
      </form>
    </div>
  );
}