import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerAuth(data.name, data.email, data.password, data.phone);
      // toast.success('Đăng ký thành công! Hãy kiểm tra email để xác thực tài khoản.');
      // navigate(`/verify-email-notice?email=${encodeURIComponent(data.email)}`);
      toast.success('Đăng ký thành công!');
navigate('/');
    } catch (error) {
      toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5ef] font-serif text-[#5e4a36] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#b8935f]/20">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-[#e7dccb] shadow-sm">
        <div>
          <h2 className="mt-4 text-center text-3xl font-normal text-[#1f1a14] tracking-wide">
            Đăng ký tài khoản
          </h2>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            <div>
              <label className="block text-[11px] tracking-widest uppercase text-[#7b6753] font-medium">Họ tên</label>
              <input
                {...register('name', { required: 'Họ tên là bắt buộc' })}
                type="text"
                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-[#e7dccb] placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#b8935f] focus:border-[#b8935f] font-sans text-sm mt-1.5 transition-all"
                placeholder="Nhập họ và tên"
              />
              {errors.name && <p className="mt-1 text-xs font-sans text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] tracking-widest uppercase text-[#7b6753] font-medium">Email</label>
              <input
                {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' } })}
                type="email"
                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-[#e7dccb] placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#b8935f] focus:border-[#b8935f] font-sans text-sm mt-1.5 transition-all"
                placeholder="Nhập email"
              />
              {errors.email && <p className="mt-1 text-xs font-sans text-red-600">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label className="block text-[11px] tracking-widest uppercase text-[#7b6753] font-medium">Mật khẩu</label>
              <input
                {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' } })}
                type={showPassword ? 'text' : 'password'}
                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-[#e7dccb] placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#b8935f] focus:border-[#b8935f] font-sans text-sm mt-1.5 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center text-[#7b6753] hover:text-[#b8935f] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="mt-1 text-xs font-sans text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] tracking-widest uppercase text-[#7b6753] font-medium">Xác nhận mật khẩu</label>
              <input
                {...register('confirmPassword', { 
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: value => value === password || 'Mật khẩu không khớp'
                })}
                type="password"
                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-[#e7dccb] placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#b8935f] focus:border-[#b8935f] font-sans text-sm mt-1.5 transition-all"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs font-sans text-red-600">{errors.confirmPassword.message}</p>}
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 border border-none bg-[#b8935f] text-white text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-[#b8935f]/15 flex items-center justify-center gap-2 enabled:hover:bg-[#a57f4c] enabled:hover:-translate-y-0.5 disabled:bg-[#e7dccb] disabled:text-[#7b6753] disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Đăng ký'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs tracking-wide pt-2 border-t border-[#e7dccb]/60">
          <span className="text-[#7b6753]">Đã có tài khoản? </span>
          <Link to="/login" className="font-semibold text-[#b8935f] hover:text-[#a57f4c] transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}