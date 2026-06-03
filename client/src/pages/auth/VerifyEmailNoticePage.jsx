import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { Mail, RefreshCw, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const RESEND_COOLDOWN = 60; // giây

export default function VerifyEmailNoticePage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || isSending) return;
    setIsSending(true);
    try {
      await authApi.resendVerification(email);
      toast.success('Đã gửi lại email xác thực!');
      setSentCount((c) => c + 1);
      setCountdown(RESEND_COOLDOWN);
    } catch (error) {
      toast.error(error.message || 'Không thể gửi lại email');
    } finally {
      setIsSending(false);
    }
  };

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
        maxWidth: '480px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
      }}>

        {/* Icon animated */}
        <div style={{
          width: '96px',
          height: '96px',
          background: 'linear-gradient(135deg, #e94560, #c73652)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 0 40px rgba(233,69,96,0.4)',
          animation: 'pulse 2s infinite'
        }}>
          <Mail size={44} color="#fff" />
        </div>

        <h1 style={{
          color: '#ffffff',
          fontSize: '26px',
          fontWeight: '800',
          margin: '0 0 12px',
          letterSpacing: '-0.5px'
        }}>
          Kiểm tra email của bạn
        </h1>

        <p style={{ color: '#a0aec0', fontSize: '15px', lineHeight: '1.7', margin: '0 0 8px' }}>
          Chúng tôi đã gửi link xác thực đến
        </p>

        <p style={{
          color: '#e94560',
          fontSize: '16px',
          fontWeight: '700',
          margin: '0 0 28px',
          wordBreak: 'break-all'
        }}>
          {email || 'email của bạn'}
        </p>

        {/* Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          {[
            { step: '1', text: 'Mở hộp thư email của bạn' },
            { step: '2', text: 'Tìm email từ OldMan Fashion' },
            { step: '3', text: 'Click vào nút "Xác thực Email"' },
            { step: '4', text: 'Quay lại đăng nhập!' },
          ].map(({ step, text }) => (
            <div key={step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: step === '4' ? '0' : '14px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                minWidth: '28px',
                background: 'linear-gradient(135deg,#e94560,#c73652)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#fff'
              }}>
                {step}
              </div>
              <span style={{ color: '#cbd5e0', fontSize: '14px' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isSending}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '1.5px solid',
            borderColor: countdown > 0 ? 'rgba(255,255,255,0.1)' : '#e94560',
            background: 'transparent',
            color: countdown > 0 ? '#718096' : '#e94560',
            fontSize: '15px',
            fontWeight: '600',
            cursor: countdown > 0 || isSending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            marginBottom: '16px'
          }}
        >
          {isSending ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <RefreshCw size={18} />
          )}
          {isSending
            ? 'Đang gửi...'
            : countdown > 0
              ? `Gửi lại sau ${countdown}s`
              : 'Gửi lại email xác thực'
          }
        </button>

        {sentCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#48bb78',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <CheckCircle size={15} />
            <span>Đã gửi lại {sentCount} lần. Kiểm tra cả thư mục Spam nhé!</span>
          </div>
        )}

        <Link
          to="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#a0aec0',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#a0aec0'}
        >
          <ArrowRight size={15} />
          Đã xác thực? Đăng nhập ngay
        </Link>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(233,69,96,0.4); }
          50% { box-shadow: 0 0 60px rgba(233,69,96,0.7); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
