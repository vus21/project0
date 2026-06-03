import nodemailer from 'nodemailer';

// Tạo transporter — dùng Gmail nếu có cấu hình, ngược lại dùng Ethereal (test)
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Fallback: Ethereal (fake SMTP cho dev — in preview URL ra console)
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 [Email Dev] Dùng Ethereal test account:', testAccount.user);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

export const sendVerificationEmail = async (toEmail, userName, token) => {
  const transporter = await createTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyLink = `${clientUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"OldMan Fashion" <${process.env.EMAIL_USER || 'noreply@oldman.com'}>`,
    to: toEmail,
    subject: '✅ Xác thực email tài khoản OldMan Fashion',
    html: `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác thực email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#e94560;font-size:28px;font-weight:800;letter-spacing:2px;">OLDMAN</h1>
              <p style="margin:6px 0 0;color:#a0aec0;font-size:14px;letter-spacing:1px;">FASHION STORE</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:24px;font-weight:700;">
                Xin chào, ${userName}! 👋
              </h2>
              <p style="margin:0 0 24px;color:#4a5568;font-size:16px;line-height:1.6;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>OldMan Fashion</strong>. 
                Vui lòng xác thực địa chỉ email của bạn để hoàn tất quá trình đăng ký.
              </p>
              
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:linear-gradient(135deg,#e94560,#c73652);border-radius:10px;padding:0;">
                    <a href="${verifyLink}" 
                       style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                      ✅ Xác thực Email Ngay
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#718096;font-size:14px;">
                Hoặc copy link sau vào trình duyệt:
              </p>
              <p style="margin:0 0 24px;padding:12px 16px;background:#f7f8fa;border-radius:8px;border-left:4px solid #e94560;word-break:break-all;font-size:13px;color:#4a5568;">
                ${verifyLink}
              </p>

              <div style="padding:16px;background:#fffbeb;border-radius:8px;border:1px solid #f6e05e;">
                <p style="margin:0;color:#744210;font-size:14px;">
                  ⏰ <strong>Link xác thực có hiệu lực trong 24 giờ.</strong> 
                  Sau thời gian này, bạn cần yêu cầu gửi lại email xác thực.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;background:#f7f8fa;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 8px;color:#a0aec0;font-size:13px;">
                Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.
              </p>
              <p style="margin:0;color:#cbd5e0;font-size:12px;">
                © 2024 OldMan Fashion. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };

  const info = await transporter.sendMail(mailOptions);

  // Nếu dùng Ethereal thì in preview URL ra console
  if (!process.env.EMAIL_USER) {
    console.log('📧 [Email Dev] Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};
