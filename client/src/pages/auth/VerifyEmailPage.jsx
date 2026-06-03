import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { CheckCircle2, XCircle, Loader2, LogIn } from 'lucide-react';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus(STATUS.ERROR);
      setMessage('Không tìm thấy token xác thực. Link không hợp lệ.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setMessage(res.data?.message || 'Xác thực email thành công!');
        setStatus(STATUS.SUCCESS);
      } catch (error) {
        setMessage(error.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.');
        setStatus(STATUS.ERROR);
      }
    };

    verify();
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '56px 40px',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
      }}>

        {/* Brand */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#e94560',
            fontSize: '22px',
            fontWeight: '800',
            letterSpacing: '3px',
            margin: 0
          }}>OLDMAN</h2>
          <p style={{ color: '#4a5568', fontSize: '11px', letterSpacing: '2px', margin: '4px 0 0' }}>
            FASHION STORE
          </p>
        </div>

        {/* Loading State */}
        {status === STATUS.LOADING && (
          <>
            <div style={{
              width: '88px',
              height: '88px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px'
            }}>
              <Loader2 size={40} color="#e94560" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 12px' }}>
              Đang xác thực email...
            </h1>
            <p style={{ color: '#718096', fontSize: '15px', margin: 0 }}>
              Vui lòng đợi trong giây lát
            </p>
          </>
        )}

        {/* Success State */}
        {status === STATUS.SUCCESS && (
          <>
            <div style={{
              width: '88px',
              height: '88px',
              background: 'linear-gradient(135deg, #48bb78, #38a169)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              boxShadow: '0 0 40px rgba(72,187,120,0.4)',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <CheckCircle2 size={44} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>
              Xác thực thành công! 🎉
            </h1>
            <p style={{ color: '#a0aec0', fontSize: '15px', lineHeight: '1.6', margin: '0 0 36px' }}>
              {message}
            </p>
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '15px 32px',
                background: 'linear-gradient(135deg, #e94560, #c73652)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                boxShadow: '0 8px 24px rgba(233,69,96,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(233,69,96,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(233,69,96,0.35)';
              }}
            >
              <LogIn size={18} />
              Đăng nhập ngay
            </Link>
          </>
        )}

        {/* Error State */}
        {status === STATUS.ERROR && (
          <>
            <div style={{
              width: '88px',
              height: '88px',
              background: 'linear-gradient(135deg, #fc8181, #e53e3e)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              boxShadow: '0 0 40px rgba(229,62,62,0.4)',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <XCircle size={44} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>
              Xác thực thất bại
            </h1>
            <p style={{ color: '#a0aec0', fontSize: '15px', lineHeight: '1.6', margin: '0 0 36px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/register"
                style={{
                  display: 'block',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #e94560, #c73652)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(233,69,96,0.35)'
                }}
              >
                Đăng ký lại
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'block',
                  padding: '14px',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  color: '#a0aec0',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                Về trang đăng nhập
              </Link>
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
