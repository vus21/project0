# Feature Progress Tracker

## Tổng quan tiến độ
- **Server API**: 69/69 endpoints (100%) ⚠️ *Có 5 lỗ hổng bảo mật cần vá*
- **Client UI**: 20/30 tính năng (67%)
- **Tổng thể**: 89/99 tính năng (89.9%)

> ⚠️ **Lưu ý:** Số liệu server tính theo endpoint đã code xong. Một số endpoint có lỗi logic hoặc bảo mật — xem mục **Known Bugs** bên dưới.

---

## Guest Features (6/6 Server ✅ | 6/6 Client ✅)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Đăng ký / đăng nhập (merge cart) | ✅ | ✅ | ✅ Hoàn thành |
| Xem danh sách sản phẩm | ✅ | ✅ | ✅ Hoàn thành (`/products` — ProductsPage) |
| Tìm kiếm, lọc, sắp xếp sản phẩm | ✅ | ✅ | ✅ Hoàn thành (search/filter/sort trong ProductsPage) |
| Xem chi tiết sản phẩm | ✅ | ✅ | ✅ Hoàn thành (`/products/:id` — ProductDetailPage) |
| Xem đánh giá sản phẩm | ✅ | ✅ | ✅ Hoàn thành (tab trong ProductDetailPage) |
<!-- | Thêm sản phẩm vào giỏ hàng | ✅ | ✅ | ✅ Hoàn thành (CartPage + CartContext) | -->

---

## User Features (10/11 Server | 3/11 Client)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Tất cả chức năng của Guest | ✅ | ✅ | ✅ Hoàn thành |
| Thanh toán đơn hàng (COD) | ✅ | ✅ | ⚠️ CheckoutPage có bugs — xem Known Bugs |
| Quản lý thông tin cá nhân | ✅ | ❌ | ⚠️ Placeholder (`/profile`) |
| Quản lý địa chỉ giao hàng | ✅ | ❌ | ⚠️ Placeholder (`/address`); có inline form trong Checkout |
| Theo dõi đơn hàng | ✅ | ❌ | ⚠️ Placeholder (`/orders`) |
| Xem lịch sử mua hàng | ✅ | ❌ | ⚠️ Placeholder |
<!-- | Áp mã giảm giá | ✅ | ❌ | ⚠️ Client hardcode, không kết nối API thực | -->
| Hủy đơn (nếu chưa xử lý) | ✅ | ❌ | ⚠️ Server có API, Client chưa có UI |
| Đánh giá / bình luận sản phẩm | ✅ | ❌ | ⚠️ Chưa có form gửi review phía Client |
| Wishlist (yêu thích) | ✅ | ❌ | ⚠️ Placeholder (`/wishlist`) |
| Nhận thông báo đơn hàng | ❌ | ❌ | ❌ Chưa có hệ thống notification |

---

## Admin Features (9/9 Server ✅ | 7/9 Client)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Dashboard thống kê | ✅ | ✅ | ✅ Hoàn thành |
| Quản lý người dùng | ✅ | ✅ | ✅ Hoàn thành (UserPage — xem/khóa user) |
| Quản lý sản phẩm (variants/SKU/tồn kho) | ✅ | ✅ | ✅ Hoàn thành |
| Quản lý danh mục | ✅ | ✅ | ✅ Hoàn thành |
| Quản lý đơn hàng | ✅ | ✅ | ✅ Hoàn thành (OrdersPage) |
| Cập nhật trạng thái đơn hàng | ✅ | ✅ | ✅ Hoàn thành (trong OrdersPage) |
| Quản lý kho hàng | ✅ | ✅ | ✅ Hoàn thành (InventoryPage + InventoryFormPage) |
| Quản lý mã giảm giá | ✅ | ❌ | ⚠️ Placeholder (`/admin/vouchers`) |
| Thêm admin | ✅ | ❌ | ⚠️ API có nhưng Client chưa có form riêng |

---

## Extend Features (0/3 - 0%)

| Tính năng | Server | Client | Trạng thái |
|-----------|--------|--------|------------|
| Quản lý banner / sản phẩm nổi bật | ❌ | ❌ | ❌ Chưa có |
| Quản lý doanh thu & báo cáo | ❌ | ❌ | ❌ Chưa có |
| Thanh toán online (VNPAY/MOMO/Stripe) | ❌ | ❌ | ❌ Chưa có |

---

## 🐛 Known Bugs (Phát hiện 2026-05-24)

### 🔴 Critical — Cần sửa ngay

| # | File | Mô tả |
|---|------|--------|

| B3 | `order.routes.js` | Route `GET /admin/all` và `/admin/stats` bị `GET /:id` nuốt mất (thứ tự sai) |
| B4 | `address.service.js` | Toàn bộ query dùng field `user` thay vì `user_id` theo schema → địa chỉ không hoạt động |
| B5 | `review.service.js` | Query dùng `product` thay vì `product_id` → unique check thất bại, review bị trùng |
| B6 | `CheckoutPage.jsx` | `setIsSubmitting(false)` đặt sai vị trí → có thể đặt đơn hàng trùng |
| B7 | `auth.service.js` | `seedUser()` crash do thiếu import (`USER_ROLES`, `Product`, `Category`); có dead code |

### 🟡 Moderate — Sửa sớm

| # | File | Mô tả |
|---|------|--------|
| B8 | `CheckoutPage.jsx` | Redirect về `/profile/orders` nhưng route không tồn tại trong AppRouter |
| B9 | `CheckoutPage.jsx` | Voucher hardcode `OLDMAN10`, không kết nối `/vouchers/apply` API |
| B10 | `AuthContext.jsx` | `register()` lưu `accessToken` nhưng server không trả về → auto-login sau đăng ký bị lỗi |
| B11 | `axiosInstance.js` | Refresh token response bị unwrap đôi (`res.data.accessToken` → nên là `res.accessToken`) |
| B12 | `CartContext.jsx` | `updateCartItem`, `removeCartItem` không được expose qua context |

### 🟢 Minor — Cải thiện sau

| # | File | Mô tả |
|---|------|--------|
| B13 | `review.service.js` | Sort parameter không có tác dụng (cả 2 nhánh đều `{ createdAt: -1 }`) |
| B14 | `Product.js` | Slug dùng random 0–9999 → vẫn có thể collision khi nhiều sản phẩm cùng tên |
| B15 | `app.js` | Rate limit `max: 10000` nhưng comment ghi "100 request" — gần như vô dụng |
| B16 | `order.service.js` | Bypass transition check: admin có thể hủy đơn `DELIVERED` → không hợp lý nghiệp vụ |

---

## Chi tiết API Endpoints (Server)

### Authentication (8/8) ✅
- ✅ POST /register
- ✅ POST /login
- ✅ POST /logout
- ✅ POST /refresh-token
- ✅ GET /profile ⚠️ *Thiếu `protect` middleware*
- ✅ PUT /profile ⚠️ *Thiếu `protect` middleware*
- ✅ PUT /change-password ⚠️ *Thiếu `protect` middleware*
- ✅ POST /avatar ⚠️ *Thiếu `protect` middleware*

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
- ✅ POST / ⚠️ *Thiếu admin guard*
- ✅ PUT /:id ⚠️ *Thiếu admin guard*
- ✅ DELETE /:id ⚠️ *Thiếu admin guard*
- ✅ DELETE /:id/images ⚠️ *Thiếu admin guard*
- ✅ POST /:id/variants ⚠️ *Thiếu admin guard*

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
- ✅ GET /admin/all ⚠️ *Bị route `/:id` che (thứ tự sai)*
- ✅ PUT /admin/:id/status
- ✅ GET /admin/stats ⚠️ *Bị route `/:id` che (thứ tự sai)*

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

### Đã có (16 pages / components)

**Shop (User-facing)**
- ✅ LoginPage (`/login`)
- ✅ RegisterPage (`/register`)
- ✅ HomePage (`/`)
- ✅ ProductsPage — danh sách + tìm kiếm + lọc (`/products`)
- ✅ ProductDetailPage — chi tiết + reviews + add to cart (`/products/:id`)
- ✅ CartPage (`/cart`)
- ✅ CheckoutPage — đặt hàng + chọn địa chỉ (`/checkout`) ⚠️ *Có bugs*

**Admin**
- ✅ DashboardPage (`/admin`)
- ✅ ProductsPage Admin (`/admin/products`)
- ✅ ProductFormPage — tạo/sửa sản phẩm (`/admin/products/new`, `/admin/products/:id/edit`)
- ✅ CategoryPage (`/admin/categories`)
- ✅ CategoriesFormPage (`/admin/categories/new`, `/admin/categories/:id/edit`)
- ✅ InventoryPage (`/admin/inventory`)
- ✅ InventoryFormPage — sửa stock (`/admin/inventory/:id`)
- ✅ OrdersPage — quản lý + cập nhật trạng thái (`/admin/orders`)
- ✅ UserPage — xem danh sách + khóa user (`/admin/users`)

### Placeholder (Coming soon)
- ❌ Profile Page (`/profile`)
- ❌ Order History Page (`/orders`)
- ❌ Wishlist Page (`/wishlist`)
- ❌ Address Management Page (`/address`)
- ❌ Admin Vouchers Page (`/admin/vouchers`)
- ❌ Admin User Edit Page (`/admin/users/:id/edit`)

### Chưa có route
- ❌ Review Management Page (User)
- ❌ Order Detail Page (User)
- ❌ Admin Reports Page

---

## Ưu tiên phát triển tiếp theo

### Priority 0 — Vá Bug Trước Khi Tiếp Tục (🔴 Critical)
1. **[B4]** Fix `address.service.js` — sửa `user` → `user_id`
2. **[B5]** Fix `review.service.js` — sửa `product` → `product_id`
3. **[B1]** Thêm `protect` + `restrictTo(ADMIN)` vào `product.routes.js`
4. **[B2]** Bỏ comment `router.use(protect)` trong `auth.routes.js`
5. **[B3]** Đổi thứ tự routes `order.routes.js` (admin routes lên trước `/:id`)
6. **[B6]** Fix `CheckoutPage.jsx` — `setIsSubmitting` sai vị trí
7. **[B7]** Fix `auth.service.js` — seedUser thiếu import

### Priority 1 (Cao)
1. Profile Page (User) — cập nhật thông tin, đổi mật khẩu
2. Order History + Order Detail Page (User)
3. Address Management Page (User)
4. Kết nối Voucher API thực vào CheckoutPage

### Priority 2 (Trung bình)
5. Wishlist Page (User)
6. Form gửi Review (trong ProductDetail)
7. Admin Vouchers Page
8. Hủy đơn hàng (UI cho user)

### Priority 3 (Thấp)
9. Hệ thống notification/email
10. Admin Reports Page
11. Admin User Edit Page (sửa thông tin user)

### Priority 4 (Extend)
12. Quản lý banner/sản phẩm nổi bật
13. Thanh toán online (VNPAY/MOMO/Stripe)
14. Báo cáo nâng cao

---

## Cập nhật lần cuối
- **Ngày**: 2026-05-24
- **Server**: 100% endpoints hoàn thành *(có 7 bugs cần vá)*
- **Client**: ~67% hoàn thành *(16/16 pages đã code, nhưng 6 vẫn là placeholder)*
- **Tổng**: ~89% hoàn thành
- **Bugs phát hiện**: 16 (7 critical, 5 moderate, 4 minor)
