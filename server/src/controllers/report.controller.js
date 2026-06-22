import { asyncHandler } from '../middlewares/asyncHandler.js';
import { adminService } from '../services/admin.service.js';
import { HTTP_STATUS } from '../constants/index.js';
// Khám phá lý do không import ApiResponse ở phần lưu ý bên dưới

export const exportExcel = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Sinh chuỗi yyyyMMdd

  let workbook;
  let filename = `report-${dateStr}.xlsx`;

  switch (type) {
    case 'revenue':
      workbook = await adminService.exportRevenueExcel();
      filename = `revenue-report-${dateStr}.xlsx`;
      break;

    case 'orders':
      workbook = await adminService.exportOrdersExcel();
      filename = `orders-report-${dateStr}.xlsx`;
      break;

    case 'inventory':
      workbook = await adminService.exportInventoryExcel();
      filename = `inventory-report-${dateStr}.xlsx`;
      break;

    default:
      res.status(HTTP_STATUS.BAD_REQUEST);
      throw new Error('Loại báo cáo không hợp lệ! Vui lòng chọn revenue, orders, hoặc inventory.');
  }

  // Thiết lập Headers cấu hình luồng tải file nhị phân (Stream) về trình duyệt
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Ghi trực tiếp dữ liệu từ workbook vào response stream
  await workbook.xlsx.write(res);
  res.end();
});

export const exportPdf = asyncHandler(async (req, res) => {
  const adminName = req.user ? req.user.name : 'Quản trị viên OLDMAN';

  // Thiết lập Headers cấu hình tải file PDF trực tiếp từ luồng ghi
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=dashboard-report.pdf');

  await adminService.exportDashboardPdf(res, adminName);
});