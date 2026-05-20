# E-Commerce API Documentation

Đây là tài liệu API tóm tắt cho ứng dụng MERN Stack E-Commerce (Phase 1-8).

## Thông tin chung
- **Base URL:** `http://localhost:5000/api`
- **Authentication:** Bearer Token (JWT). Truyền token vào header:
  `Authorization: Bearer <your_access_token>`

## Danh sách Endpoints (Tổng ~69 API)

### 1. Authentication (`/api/auth`)
- `POST /register`: Đăng ký tài khoản mới (Public)
- `POST /login`: Đăng nhập lấy Token (Public)
- `POST /logout`: Đăng xuất (xóa Refresh Token cookie)
- `POST /refresh-token`: Lấy Access Token mới
- `GET /profile`: Lấy thông tin cá nhân (User)
- `PUT /profile`: Cập nhật thông tin (User)
- `PUT /change-password`: Đổi mật khẩu (User)
- `POST /avatar`: Upload ảnh đại diện (User)

### 2. Categories (`/api/categories`)
- `GET /`: Lấy danh sách danh mục (Public)
- `GET /:slug`: Lấy chi tiết danh mục theo slug (Public)
- `POST /`: Tạo danh mục mới (Admin)
- `PUT /:id`: Cập nhật danh mục (Admin)
- `DELETE /:id`: Xóa danh mục (Admin)

### 3. Products (`/api/products`)
- `GET /`: Lấy danh sách sản phẩm (Search, Filter, Pagination) (Public)
- `GET /:slug`: Lấy chi tiết sản phẩm (Public)
- `GET /:id/related`: Lấy sản phẩm liên quan (Public)
- `GET /:productId/reviews`: Lấy danh sách đánh giá của sản phẩm (Public)
- `POST /:productId/reviews`: Tạo đánh giá mới (User, Require Purchased)
- `POST /`: Tạo sản phẩm (Admin)
- `PUT /:id`: Cập nhật sản phẩm (Admin)
- `DELETE /:id`: Xóa sản phẩm mềm (Admin)
- `DELETE /:id/images`: Xóa ảnh cụ thể (Admin)
- `POST /:id/variants`: Quản lý biến thể màu/size (Admin)

### 4. Cart (`/api/cart`)
- `GET /`: Xem giỏ hàng (User)
- `POST /add`: Thêm sản phẩm (User)
- `PUT /update`: Cập nhật số lượng (User)
- `DELETE /remove`: Xóa 1 sản phẩm (User)
- `DELETE /clear`: Xóa toàn bộ giỏ hàng (User)
- `POST /merge`: Đồng bộ giỏ hàng khách với tài khoản (User)
- `POST /sync-prices`: Cập nhật giá mới nhất (User)

### 5. Vouchers (`/api/vouchers`)
- `POST /apply`: Áp mã giảm giá thử (User)
- `GET /`: Lấy danh sách mã (Admin)
- `POST /`: Tạo mã mới (Admin)
- `PUT /:id`: Sửa mã (Admin)
- `DELETE /:id`: Khóa mã (Admin)

### 6. Orders (`/api/orders`)
- `POST /`: Đặt hàng (User)
- `GET /`: Lịch sử đặt hàng (User)
- `GET /:id`: Chi tiết 1 đơn (User)
- `PUT /:id/cancel`: Hủy đơn (User)
- `GET /admin/all`: Xem tất cả đơn hàng (Admin)
- `PUT /admin/:id/status`: Thay đổi trạng thái đơn (Admin)
- `GET /admin/stats`: Lấy thông số đơn (Admin)

### 7. Inventory (`/api/inventory`)
- `GET /low-stock`: Cảnh báo sắp hết hàng (Admin)
- `GET /out-of-stock`: Cảnh báo hết hàng (Admin)
- `PUT /:productId/sku/:sku`: Chỉnh tồn kho bằng tay (Admin)

### 8. Reviews (`/api/reviews`)
- `GET /my`: Quản lý đánh giá cá nhân (User)
- `PUT /:reviewId`: Sửa bài đánh giá (User)
- `DELETE /:reviewId`: Xóa bài đánh giá (User/Admin)

### 9. Wishlist (`/api/wishlist`)
- `GET /`: Danh sách yêu thích (User)
- `POST /:productId`: Thêm (User)
- `DELETE /:productId`: Xóa (User)
- `PUT /:productId/toggle`: Chuyển trạng thái Thêm/Xóa (User)

### 10. Addresses (`/api/addresses`)
- `GET /`: Lấy sổ địa chỉ (User)
- `POST /`: Thêm địa chỉ mới (User)
- `PUT /:id`: Sửa địa chỉ (User)
- `DELETE /:id`: Xóa (User)
- `PUT /:id/set-default`: Cài làm mặc định (User)

### 11. Admin Dashboard (`/api/admin`)
- `GET /dashboard`: Overview Data (Admin)
- `GET /revenue-chart`: Biểu đồ doanh thu năm (Admin)
- `GET /top-products`: Sản phẩm bán chạy (Admin)
- `GET /recent-orders`: Đơn hàng gần nhất (Admin)
- `GET /sales-by-category`: Doanh thu theo danh mục (Admin)
- `GET /users`: Quản lý danh sách User (Admin)
- `GET /users/:id`: Chi tiết User (Admin)
- `POST /users/create-admin`: Tạo Admin mới (Admin)
- `PUT /users/:id`: Cập nhật thông tin User (Admin)
- `DELETE /users/:id`: Khóa tài khoản User (Admin)

---

## Chuẩn Response của API (Chuẩn hóa toàn Server)

**Thành công (200, 201)**
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... },
  "pagination": {
    "total": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

**Thất bại (400, 401, 403, 404, 409, 500)**
```json
{
  "success": false,
  "message": "Mô tả lỗi (ví dụ: Không tìm thấy sản phẩm)",
  "error": "Not Found" // Chỉ hiển thị stack trace ở môi trường DEV
}
```
