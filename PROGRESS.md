# Feature Progress Tracker

## Tổng quan tiến độ
- **Server API**: 69/69 endpoints (100%)
- **Client UI**: 8/30 tính năng (27%)
- **Tổng thể**: 77/99 tính năng (77.8%)

---

## Guest Features (6/6 - 100%)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Đăng ký / đăng nhập (merge cart) | ✅ | ✅ | ✅ Hoàn thành |
| Xem danh sách sản phẩm | ✅ | ❌ | ⚠️ Client thiếu |
| Tìm kiếm, lọc, sắp xếp sản phẩm | ✅ | ❌ | ⚠️ Client thiếu |
| Xem chi tiết sản phẩm | ✅ | ❌ | ⚠️ Client thiếu |
| Xem đánh giá sản phẩm | ✅ | ❌ | ⚠️ Client thiếu |
| Thêm sản phẩm vào giỏ hàng | ✅ | ❌ | ⚠️ Client thiếu |

---

## User Features (11/12 - 92%)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Tất cả chức năng của Guest | ✅ | ❌ | ⚠️ Client thiếu |
| Quản lý thông tin cá nhân | ✅ | ❌ | ⚠️ Client thiếu |
| Quản lý địa chỉ giao hàng | ✅ | ❌ | ⚠️ Client thiếu |
| Theo dõi đơn hàng | ✅ | ❌ | ⚠️ Client thiếu |
| Xem lịch sử mua hàng | ✅ | ❌ | ⚠️ Client thiếu |
| Áp mã giảm giá | ✅ | ❌ | ⚠️ Client thiếu |
| Thanh toán đơn hàng (COD) | ✅ | ❌ | ⚠️ Client thiếu |
| Hủy đơn (nếu chưa xử lý) | ✅ | ❌ | ⚠️ Client thiếu |
| Đánh giá / bình luận sản phẩm | ✅ | ❌ | ⚠️ Client thiếu |
| Wishlist (yêu thích) | ✅ | ❌ | ⚠️ Client thiếu |
| Nhận thông báo đơn hàng | ❌ | ❌ | ❌ Chưa có hệ thống notification |

---

## Admin Features (9/9 - 100%)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Dashboard thống kê | ✅ | ✅ | ✅ Hoàn thành |
| Quản lý người dùng | ✅ | ❌ | ⚠️ Client thiếu |
| Quản lý sản phẩm (variants/SKU/tồn kho) | ✅ | ✅ | ✅ Hoàn thành |
| Quản lý danh mục | ✅ | ✅ | ✅ Hoàn thành |
| Quản lý đơn hàng | ✅ | ❌ | ⚠️ Client thiếu |
| Cập nhật trạng thái đơn hàng | ✅ | ❌ | ⚠️ Client thiếu |
| Quản lý mã giảm giá | ✅ | ❌ | ⚠️ Client thiếu |
| Thêm admin | ✅ | ❌ | ⚠️ Client thiếu |
| Quản lý kho hàng | ✅ | ✅ | ✅ Hoàn thành |

---

## Extend Features (0/3 - 0%)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Quản lý banner / sản phẩm nổi bật | ❌ | ❌ | ❌ Chưa có |
| Quản lý doanh thu & báo cáo | ❌ | ❌ | ❌ Chưa có |
| Thanh toán online (VNPAY/MOMO/Stripe) | ❌ | ❌ | ❌ Chưa có |

---

## Chi tiết API Endpoints (Server)

### Authentication (8/8) ✅
- ✅ POST /register
- ✅ POST /login
- ✅ POST /logout
- ✅ POST /refresh-token
- ✅ GET /profile
- ✅ PUT /profile
- ✅ PUT /change-password
- ✅ POST /avatar

### Categories (5/5) ✅
- ✅ GET /
- ✅ GET /:slug
- ✅ POST /
- ✅ PUT /:id
- ✅ DELETE /:id

### Products (10/10) ✅
- ✅ GET /
- ✅ GET /:slug
- ✅ GET /:id/related
- ✅ GET /:productId/reviews
- ✅ POST /:productId/reviews
- ✅ POST /
- ✅ PUT /:id
- ✅ DELETE /:id
- ✅ DELETE /:id/images
- ✅ POST /:id/variants

### Cart (7/7) ✅
- ✅ GET /
- ✅ POST /add
- ✅ PUT /update
- ✅ DELETE /remove
- ✅ DELETE /clear
- ✅ POST /merge
- ✅ POST /sync-prices

### Vouchers (5/5) ✅
- ✅ POST /apply
- ✅ GET /
- ✅ POST /
- ✅ PUT /:id
- ✅ DELETE /:id

### Orders (7/7) ✅
- ✅ POST /
- ✅ GET /
- ✅ GET /:id
- ✅ PUT /:id/cancel
- ✅ GET /admin/all
- ✅ PUT /admin/:id/status
- ✅ GET /admin/stats

### Inventory (3/3) ✅
- ✅ GET /low-stock
- ✅ GET /out-of-stock
- ✅ PUT /:productId/sku/:sku

### Reviews (3/3) ✅
- ✅ GET /my
- ✅ PUT /:reviewId
- ✅ DELETE /:reviewId (User/Admin)

### Wishlist (4/4) ✅
- ✅ GET /
- ✅ POST /:productId
- ✅ DELETE /:productId
- ✅ PUT /:productId/toggle

### Addresses (5/5) ✅
- ✅ GET /
- ✅ POST /
- ✅ PUT /:id
- ✅ DELETE /:id
- ✅ PUT /:id/set-default

### Admin Dashboard (10/10) ✅
- ✅ GET /dashboard
- ✅ GET /revenue-chart
- ✅ GET /top-products
- ✅ GET /recent-orders
- ✅ GET /sales-by-category
- ✅ GET /users
- ✅ GET /users/:id
- ✅ POST /users/create-admin
- ✅ PUT /users/:id
- ✅ DELETE /users/:id

---

## Chi tiết Client Pages

### Đã có (7 pages)
- ✅ LoginPage
- ✅ RegisterPage
- ✅ HomePage
- ✅ DashboardPage (Admin)
- ✅ ProductsPage (Admin)
- ✅ ProductFormPage (Admin)
- ✅ CategoryPage (Admin)
- ✅ CategoriesFormPage (Admin)

### Thiếu (Coming soon)
- ❌ Trang danh sách sản phẩm
- ❌ Trang chi tiết sản phẩm
- ❌ Profile Page
- ❌ Cart Page
- ❌ Wishlist Page
- ❌ Order History Page
- ❌ Order Detail Page
- ❌ Address Management Page
- ❌ Review Management Page
- ❌ Admin Orders Page
- ❌ Admin Users Page
- ❌ Admin Vouchers Page
- ❌ Admin Inventory Page
- ❌ Admin Reports Page

---

## Ưu tiên phát triển tiếp theo

### Priority 1 (Cao)
1. Trang danh sách sản phẩm (Guest/User)
2. Trang chi tiết sản phẩm (Guest/User)
3. Cart Page (User)
4. Checkout/Thanh toán Page (User)
5. Profile Page (User)

### Priority 2 (Trung bình)
6. Order History Page (User)
7. Address Management Page (User)
8. Admin Orders Page
9. Admin Users Page
10. Admin Vouchers Page

### Priority 3 (Thấp)
11. Wishlist Page (User)
12. Review Management Page (User)
13. Admin Inventory Page
14. Admin Reports Page
15. Hệ thống notification/email

### Priority 4 (Extend)
16. Quản lý banner/sản phẩm nổi bật
17. Thanh toán online (VNPAY/MOMO/Stripe)
18. Báo cáo nâng cao

---

## Cập nhật lần cuối
- **Ngày**: 2026-05-19
- **Server**: 100% hoàn thành
- **Client**: 24% hoàn thành
- **Tổng**: 77.5% hoàn thành
