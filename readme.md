ôi đã bỏ comment tạm thời các phần check quyền Admin (protect và restrictTo('admin')) ở 2 file src/routes/product.routes.js và src/routes/category.routes.js.

Bây giờ toàn bộ các API thêm/sửa/xóa Sản phẩm và Danh mục đều là Public, bạn có thể thoải mái mở Postman lên test tạo dữ liệu hoặc upload hình ảnh mà không cần phải truyền Bearer Token hay lo lỗi 401/403 nữa nhé!

(Ghi chú: Khi nào test xong xuôi và chuẩn bị qua giai đoạn ghép Frontend, bạn hãy nhớ mở comment lại 2 dòng đó để hệ thống được bảo mật nhé).