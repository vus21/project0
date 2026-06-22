import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentApi } from '../../api/paymentApi';
import { CheckCircle2, Loader2, XCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode');
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'pending_confirm', 'failed'
  const [countdown, setCountdown] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');
  
  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);
  const maxPolls = 10; // Tối đa 30 giây (10 lần * 3 giây)

  const checkStatus = async () => {
    if (!orderCode) {
      setStatus('failed');
      setErrorMsg('Không tìm thấy thông tin mã đơn hàng trong yêu cầu.');
      return;
    }

    try {
      const res = await paymentApi.getPaymentStatus(orderCode);
      const data = res.data || res;
      
      if (data.paymentStatus === 'paid') {
        setStatus('success');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      } else if (data.paymentStatus === 'failed') {
        setStatus('failed');
        setErrorMsg('Giao dịch thanh toán không thành công hoặc đã bị hủy.');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      } else {
        setStatus('pending_confirm');
      }
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
      // Giữ trạng thái đang xác nhận nếu lỗi mạng tạm thời trong lúc polling
      if (status === 'loading') {
        setStatus('failed');
        setErrorMsg(error.message || 'Lỗi kết nối khi xác thực giao dịch.');
      }
    }
  };

  // Lần check đầu tiên
  useEffect(() => {
    checkStatus();
    
    // Thiết lập Polling mỗi 3 giây
    pollIntervalRef.current = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current >= maxPolls) {
        clearInterval(pollIntervalRef.current);
        setStatus('failed');
        setErrorMsg('Quá thời gian xác nhận giao dịch. Vui lòng kiểm tra lại lịch sử đơn hàng của bạn.');
      } else {
        checkStatus();
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderCode]);

  // Đếm ngược chuyển hướng khi thanh toán thành công
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile', { state: { activeTab: 'orders' } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center font-serif text-[#5e4a36] px-6 py-12 selection:bg-[#b8935f]/10">
      <div className="bg-white border border-[#e7dccb] rounded-2xl p-8 md:p-12 shadow-sm max-w-lg w-full text-center relative overflow-hidden">
        
        {/* Loading state */}
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="w-12 h-12 text-[#b8935f] animate-spin mb-4" />
            <h2 className="text-xl font-normal text-[#1f1a14] tracking-wide mb-2">
              Đang xác thực giao dịch
            </h2>
            <p className="text-sm text-[#7b6753] font-sans">
              Vui lòng không đóng trình duyệt hoặc tải lại trang này...
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-600 mb-6 shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-normal text-[#1f1a14] tracking-wide mb-3">
              Thanh Toán Thành Công!
            </h2>
            <p className="text-sm text-[#7b6753] font-sans max-w-sm leading-relaxed mb-8">
              Cảm ơn quý khách đã tin dùng sản phẩm thời trang cao cấp của <strong>OLDMAN</strong>. Đơn hàng của bạn đang được chuẩn bị đóng gói và vận chuyển.
            </p>
            
            <div className="bg-[#fcfaf7] border border-[#e7dccb]/70 rounded-xl px-5 py-3 text-xs font-sans text-[#7b6753] mb-8 inline-block">
              Tự động chuyển hướng về trang đơn hàng sau <strong className="text-[#b8935f] font-semibold text-sm">{countdown}s</strong>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={() => navigate('/profile', { state: { activeTab: 'orders' } })}
                className="h-11 px-6 bg-[#b8935f] text-white text-xs font-semibold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-[#a57f4c] transition-all cursor-pointer shadow-sm"
              >
                Xem chi tiết đơn hàng <ArrowRight size={14} />
              </button>
              <Link
                to="/"
                className="h-11 px-6 border border-[#e7dccb] bg-transparent text-[#7b6753] text-xs font-semibold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:border-[#b8935f] hover:text-[#1f1a14] transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}

        {/* Pending confirm state */}
        {status === 'pending_confirm' && (
          <div className="flex flex-col items-center py-4">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-[#f5efe6] rounded-full flex items-center justify-center border border-[#e7dccb] text-[#b8935f]">
                <ShoppingBag size={28} />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8935f]/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#b8935f]"></span>
              </span>
            </div>
            <h2 className="text-xl font-normal text-[#1f1a14] tracking-wide mb-3">
              Đang xác nhận giao dịch...
            </h2>
            <p className="text-sm text-[#7b6753] font-sans max-w-sm leading-relaxed mb-6">
              Hệ thống đang đồng bộ trạng thái thanh toán từ cổng PayOS. Quá trình này có thể mất vài giây.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-sans text-[#b8935f] animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Vui lòng chờ trong giây lát
            </div>
          </div>
        )}

        {/* Failed state */}
        {status === 'failed' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 text-red-600 mb-6 shadow-inner">
              <XCircle size={36} />
            </div>
            <h2 className="text-2xl font-normal text-red-800 tracking-wide mb-3">
              Thanh Toán Thất Bại
            </h2>
            <p className="text-sm text-red-600/80 font-sans max-w-sm leading-relaxed mb-8">
              {errorMsg || 'Có lỗi xảy ra trong quá trình xử lý giao dịch hoặc giao dịch đã bị hủy từ phía khách hàng.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link
                to="/cart"
                className="h-11 px-6 bg-[#b8935f] text-white text-xs font-semibold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-[#a57f4c] transition-all cursor-pointer shadow-sm"
              >
                Quay lại giỏ hàng
              </Link>
              <Link
                to="/"
                className="h-11 px-6 border border-[#e7dccb] bg-transparent text-[#7b6753] text-xs font-semibold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:border-[#b8935f] hover:text-[#1f1a14] transition-colors"
              >
                Trang chủ cửa hàng
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
