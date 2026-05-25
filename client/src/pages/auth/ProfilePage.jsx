import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/orderApi';
import { addressApi } from '../../api/addressApi';
import { authApi } from '../../api/authApi';


function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function ProfilePage() {
    const { user, logout, updateUser, isAuthenticated, isLoading: authLoading } = useAuth();

    // Quản lý các Tab trong Profile
    const [activeTab, setActiveTab] = useState('account'); // account | orders | addresses

    // --- States cho Tab Tài Khoản ---
    const [accountForm, setAccountForm] = useState({ name: '', phone: '', email: '' });
    const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

    // --- States cho Tab Đơn Hàng ---
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null, reason: '' });

    // --- States cho Tab Địa Chỉ ---
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [addressForm, setAddressForm] = useState({ isOpen: false, id: null, fullName: '', phone: '', city: '', ward: '', detail: '', isDefault: false });
// Khởi tạo bảng màu trạng thái Tailwind CSS theo yêu cầu của bạn
const ORDER_STATUS_COLORS = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipping: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-gray-50 text-gray-700 border-gray-200'
};

// Ánh xạ text hiển thị Tiếng Việt sang trọng
const ORDER_STATUS_LABELS = {
    pending: 'Chờ thanh toán',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy đơn',
    refunded: 'Đã hoàn tiền'
};
    // Đồng bộ dữ liệu User vào Form khi thông tin tài khoản load xong
    useEffect(() => {
        if (user) {
            setAccountForm({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
        }
    }, [user]);

    // Fetch dữ liệu tương ứng theo từng Tab
    useEffect(() => {
        if (!isAuthenticated) return;

        if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [activeTab, isAuthenticated]);

    // --- XỬ LÝ NGHIỆP VỤ: TÀI KHOẢN ---
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            setIsUpdatingAccount(true);
            // Gọi API cập nhật Profile
            const res = await authApi.updateProfile({ name: accountForm.name, phone: accountForm.phone });
            // Cập nhật lại AuthContext global state
            updateUser(res.data?.data || res.data || { name: accountForm.name, phone: accountForm.phone });
            alert('Đã cập nhật thông tin của bạn thành công.');
        } catch (error) {
            alert('Không thể cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setIsUpdatingAccount(false);
        }
    };

    // --- XỬ LÝ NGHIỆP VỤ: ĐƠN HÀNG ---
    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const res = await orderApi.getUserOrders();
            setOrders(res.data || res.data?.orders || []);
        } catch (error) {
            console.error('Lỗi lấy lịch sử đơn hàng:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleOpenCancelModal = (orderId) => {
        setCancelModal({ isOpen: true, orderId, reason: '' });
    };

    const handleConfirmCancelOrder = async () => {
        if (!cancelModal.reason.trim()) {
            alert('Vui lòng nhập lý do hủy đơn hàng.');
            return;
        }

        try {
            // Gọi chính xác API cancelOrder
            await orderApi.cancelOrder(cancelModal.orderId, cancelModal.reason);
            alert('Đã hủy đơn hàng thành công.');
            setCancelModal({ isOpen: false, orderId: null, reason: '' });
            fetchOrders(); // Tải lại danh sách
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể hủy đơn hàng vào lúc này.');
        }
    };

    // --- XỬ LÝ NGHIỆP VỤ: SỔ ĐỊA CHỈ ---
    const fetchAddresses = async () => {
        try {
            setAddressesLoading(true);
            const res = await addressApi.getMyAddresses();
            setAddresses(res.data || res.data?.data || []);
        } catch (error) {
            console.error('Lỗi lấy danh sách địa chỉ:', error);
        } finally {
            setAddressesLoading(false);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const dataPayload = {
                fullName: addressForm.fullName,
                phone: addressForm.phone,
                city: addressForm.city,
                ward: addressForm.ward,
                detail: addressForm.detail,
                isDefault: addressForm.isDefault
            };

            if (addressForm.id) {
                await addressApi.update(addressForm.id, dataPayload);
            } else {
                await addressApi.create(dataPayload);
            }

            setAddressForm({ isOpen: false, id: null, fullName: '', phone: '', city: '', ward: '', detail: '', isDefault: false });
            fetchAddresses();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xử lý địa chỉ.');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Quý khách chắc chắn muốn xóa địa chỉ này khỏi sổ lưu trữ?')) return;
        try {
            await addressApi.delete(id);
            fetchAddresses();
        } catch (error) {
            alert('Lỗi khi xóa địa chỉ.');
        }
    };

    const handleSetDefaultAddress = async (id) => {
        try {
            await addressApi.setDefault(id);
            fetchAddresses();
        } catch (error) {
            alert('Lỗi khi đặt địa chỉ mặc định.');
        }
    };

    // Trạng thái kiểm tra quyền truy cập đăng nhập
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center font-serif">
                <p className="text-[#7b6753] tracking-widest text-sm uppercase">Đang mở không gian của bạn...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-[80vh] bg-[#f8f5ef] flex flex-col items-center justify-center px-6 font-serif">
                <h2 className="text-[#1f1a14] font-normal text-2xl mb-3 tracking-wide">Không gian hội viên</h2>
                <p className="text-[#7b6753] text-sm mb-6 font-sans text-center">Vui lòng đăng nhập để quản lý lịch sử mua sắm và thông tin cá nhân của bạn.</p>
                <a href="/login" className="px-8 py-3 bg-[#b8935f] text-white rounded-xl tracking-widest uppercase text-xs font-semibold hover:bg-[#a57f4c] transition-all">Đăng nhập ngay</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f5ef] text-[#5e4a36] pb-24 font-serif">

            {/* Khối Header Trang Cá Nhân */}
            <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
                <div className="border-b border-[#e7dccb] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <span className="text-xs tracking-widest text-[#7b6753] uppercase block mb-1">Hội viên OLDMAN</span>
                        <h1 className="text-3xl font-normal text-[#1f1a14] tracking-wide">Xin chào, {user?.name}</h1>
                    </div>
                    <button onClick={logout} className="text-xs font-sans text-[#7b6753] hover:text-[#1f1a14] underline tracking-wider uppercase">
                        Đăng xuất tài khoản
                    </button>
                </div>
            </div>

            {/* Bố cục chính: 2 Cột (Sidebar + Nội dung Tab) */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                {/* CỘT TRÁI - SIDEBAR TABS DIỀU HƯỚNG */}
                <div className="bg-white border border-[#e7dccb] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-sans text-sm tracking-wide flex items-center justify-between ${activeTab === 'account' ? 'bg-[#f5efe6] text-[#b8935f] font-semibold' : 'text-[#5e4a36] hover:bg-[#f8f5ef]'}`}
                    >
                        <span>Thông tin tài khoản</span>
                        <span className="text-xs">→</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-sans text-sm tracking-wide flex items-center justify-between ${activeTab === 'orders' ? 'bg-[#f5efe6] text-[#b8935f] font-semibold' : 'text-[#5e4a36] hover:bg-[#f8f5ef]'}`}
                    >
                        <span>Lịch sử đặt hàng</span>
                        <span className="text-xs">→</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('addresses')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-sans text-sm tracking-wide flex items-center justify-between ${activeTab === 'addresses' ? 'bg-[#f5efe6] text-[#b8935f] font-semibold' : 'text-[#5e4a36] hover:bg-[#f8f5ef]'}`}
                    >
                        <span>Sổ địa chỉ nhận hàng</span>
                        <span className="text-xs">→</span>
                    </button>
                </div>

                {/* CỘT PHẢI - NỘI DUNG CHI TIẾT THEO TAB ACTIVE */}
                <div className="lg:col-span-3 bg-white border border-[#e7dccb] rounded-2xl p-6 md:p-8 shadow-sm min-h-[400px]">

                    {/* =======================================
              TAB 1: THÔNG TIN TÀI KHOẢN 
             ======================================= */}
                    {activeTab === 'account' && (
                        <div>
                            <h2 className="text-xl font-normal text-[#1f1a14] mb-6 tracking-wide border-b border-[#f5efe6] pb-3">Chi tiết tài khoản</h2>
                            <form onSubmit={handleUpdateAccount} className="max-w-xl space-y-5 font-sans">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-[#7b6753] mb-2 font-serif">Họ và tên tên</label>
                                    <input
                                        type="text" required
                                        className="w-full h-11 border border-[#e7dccb] rounded-xl px-4 text-sm text-[#1f1a14] focus:outline-none focus:border-[#b8935f] transition-all bg-[#f8f5ef]/50"
                                        value={accountForm.name}
                                        onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-[#7b6753] mb-2 font-serif">Số điện thoại</label>
                                        <input
                                            type="tel" required
                                            className="w-full h-11 border border-[#e7dccb] rounded-xl px-4 text-sm text-[#1f1a14] focus:outline-none focus:border-[#b8935f] transition-all bg-[#f8f5ef]/50"
                                            value={accountForm.phone}
                                            onChange={e => setAccountForm({ ...accountForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-[#7b6753] mb-2 font-serif">Địa chỉ Email</label>
                                        <input
                                            type="email" disabled
                                            className="w-full h-11 border border-[#e7dccb] rounded-xl px-4 text-sm text-[#7b6753] bg-gray-50 cursor-not-allowed outline-none"
                                            value={accountForm.email}
                                        />
                                        <span className="text-[11px] text-[#7b6753] mt-1 block font-serif italic">* Email tài khoản không thể chỉnh sửa.</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit" disabled={isUpdatingAccount}
                                        className="h-11 px-8 bg-[#b8935f] text-white rounded-xl text-xs uppercase tracking-widest font-semibold font-serif hover:bg-[#a57f4c] transition-all shadow-md disabled:opacity-50"
                                    >
                                        {isUpdatingAccount ? 'Đang lưu chỉnh sửa...' : 'Cập nhật hồ sơ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* =======================================
              TAB 2: LỊCH SỬ ĐƠN HÀNG 
             ======================================= */}
                   {activeTab === 'orders' && (
    <div>
        <h2 className="text-xl font-normal text-[#1f1a14] mb-6 tracking-wide border-b border-[#f5efe6] pb-3">Đơn hàng của quý khách</h2>

        {ordersLoading ? (
            <p className="text-center py-12 text-sm text-[#7b6753] font-sans">Đang truy xuất lịch sử giao dịch...</p>
        ) : orders.length === 0 ? (
            <div className="text-center py-12 border border border-dashed border-[#e7dccb] rounded-xl">
                <p className="text-sm text-[#7b6753] mb-4 font-sans">Quý khách chưa thực hiện giao dịch nào tại hệ thống.</p>
                <a href="/" className="inline-block text-xs uppercase tracking-widest text-[#b8935f] font-semibold underline">Khám phá bộ sưu tập ngay</a>
            </div>
        ) : (
            <div className="space-y-4 font-sans">
                {orders.map(order => {
                    // Logic kiểm tra nút hủy từ Rule của Order.js: Chỉ cho phép khi Pending hoặc Confirmed
                    const statusKey = order.orderStatus?.toLowerCase() || 'pending';
                    const canCancel = ['pending', 'confirmed'].includes(statusKey);

                    

                    // Lấy class css tương ứng hoặc fallback về pending nếu không khớp
                    const statusBadgeClass = ORDER_STATUS_COLORS[statusKey] || ORDER_STATUS_COLORS['pending'];
                    const statusLabel = ORDER_STATUS_LABELS[statusKey] || order.orderStatus;

                    return (
                        <div key={order._id} className="border border-[#e7dccb] rounded-xl overflow-hidden bg-[#f8f5ef]/30">
                            {/* Header của Đơn hàng */}
                            <div className="bg-[#f5efe6]/50 px-4 py-3 border-b border-[#e7dccb] flex flex-wrap justify-between items-center gap-2 text-xs">
                                <div className="flex gap-4">
                                    <span>Mã đơn: <strong className="text-[#1f1a14] font-semibold font-mono">{order.orderCode}</strong></span>
                                    <span className="text-[#7b6753]">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div>
                                    {/* Sử dụng dynamic class & hiển thị text đã chuẩn hóa */}
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border ${statusBadgeClass}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Danh sách Item rút gọn trong Đơn hàng */}
                            <div className="p-4 divide-y divide-[#e7dccb]/50">
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4 text-sm">
                                        <img src={item.image} alt={item.name} className="w-12 h-16 object-cover border border-[#e7dccb] rounded bg-white flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[#1f1a14] font-medium truncate text-capitalize">{item.name}</h4>
                                            <p className="text-xs text-[#7b6753] mt-0.5">Phân loại: {item.color} / {item.size} • Số lượng: {item.quantity}</p>
                                        </div>
                                        <span className="font-serif text-[#b8935f] font-medium">{formatPrice(item.price)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Đơn hàng - Tổng tiền & Nút hành động */}
                            <div className="bg-white p-4 border-t border-[#e7dccb]/50 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-[#7b6753] block">Tổng thanh toán</span>
                                    <strong className="text-base font-serif text-[#1f1a14] font-medium">{formatPrice(order.totalPrice)}</strong>
                                </div>
                                {canCancel && (
                                    <button
                                        onClick={() => handleOpenCancelModal(order._id)}
                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-serif font-medium hover:bg-red-50 transition-all cursor-pointer"
                                    >
                                        Yêu cầu hủy đơn
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
)}
                    {/* =======================================
              TAB 3: SỔ ĐỊA CHỈ NHẬN HÀNG 
             ======================================= */}
                    {activeTab === 'addresses' && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-[#f5efe6] pb-3">
                                <h2 className="text-xl font-normal text-[#1f1a14] tracking-wide">Sổ địa chỉ của bạn</h2>
                                {!addressForm.isOpen && (
                                    <button
                                        onClick={() => setAddressForm({ isOpen: true, id: null, fullName: '', phone: '', city: '', ward: '', detail: '', isDefault: false })}
                                        className="px-4 py-2 bg-[#b8935f] text-white font-serif text-xs uppercase tracking-widest rounded-xl hover:bg-[#a57f4c] transition-all font-semibold"
                                    >
                                        + Thêm địa chỉ mới
                                    </button>
                                )}
                            </div>

                            {/* Form Thêm/Sửa địa chỉ ẩn hiện linh hoạt */}
                            {addressForm.isOpen && (
                                <form onSubmit={handleSaveAddress} className="mb-8 p-5 bg-[#f8f5ef]/40 border border-[#e7dccb] rounded-xl font-sans text-sm space-y-4 max-w-2xl">
                                    <h3 className="font-serif text-sm font-medium text-[#1f1a14] uppercase tracking-wider">{addressForm.id ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="Họ tên người nhận *" required
                                            className="w-full h-10 border border-[#e7dccb] rounded-xl px-4 text-xs focus:outline-none focus:border-[#b8935f] bg-white"
                                            value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                        />
                                        <input
                                            type="tel" placeholder="Số điện thoại nhận hàng *" required
                                            className="w-full h-10 border border-[#e7dccb] rounded-xl px-4 text-xs focus:outline-none focus:border-[#b8935f] bg-white"
                                            value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="Tỉnh / Thành phố *" required
                                            className="w-full h-10 border border-[#e7dccb] rounded-xl px-4 text-xs focus:outline-none focus:border-[#b8935f] bg-white"
                                            value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                        />
                                        <input
                                            type="text" placeholder="Xã / Phường / Thị trấn *" required
                                            className="w-full h-10 border border-[#e7dccb] rounded-xl px-4 text-xs focus:outline-none focus:border-[#b8935f] bg-white"
                                            value={addressForm.ward} onChange={e => setAddressForm({ ...addressForm, ward: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        type="text" placeholder="Địa chỉ cụ thể (Số nhà, tên đường, thôn xóm) *" required
                                        className="w-full h-10 border border-[#e7dccb] rounded-xl px-4 text-xs focus:outline-none focus:border-[#b8935f] bg-white"
                                        value={addressForm.detail} onChange={e => setAddressForm({ ...addressForm, detail: e.target.value })}
                                    />
                                    <div className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox" id="defaultChk" className="rounded text-[#b8935f] focus:ring-[#b8935f]"
                                            checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                        />
                                        <label htmlFor="defaultChk" className="text-xs text-[#7b6753] cursor-pointer font-serif select-none">Đặt làm địa chỉ giao hàng mặc định</label>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="px-5 h-9 bg-[#b8935f] text-white font-serif text-xs uppercase tracking-wide font-semibold rounded-lg hover:bg-[#a57f4c]">Lưu lại</button>
                                        <button type="button" onClick={() => setAddressForm({ ...addressForm, isOpen: false })} className="px-5 h-9 border border-[#e7dccb] text-[#7b6753] font-serif text-xs uppercase tracking-wide rounded-lg bg-white">Hủy</button>
                                    </div>
                                </form>
                            )}

                            {/* Danh sách địa chỉ hiển thị */}
                            {addressesLoading ? (
                                <p className="text-center py-12 text-sm text-[#7b6753] font-sans">Đang đồng bộ sổ địa chỉ...</p>
                            ) : addresses.length === 0 ? (
                                <p className="text-sm text-[#7b6753] py-6 font-sans">Quý khách chưa tạo địa chỉ lưu trữ nào.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm">
                                    {addresses.map(addr => (
                                        <div key={addr._id} className={`border rounded-xl p-4 relative bg-white transition-all ${addr.isDefault ? 'border-[#b8935f] bg-[#f5efe6]/10 shadow-sm' : 'border-[#e7dccb]'}`}>
                                            {addr.isDefault && (
                                                <span className="absolute top-3 right-3 text-[10px] uppercase font-serif tracking-widest text-[#b8935f] bg-[#f5efe6] px-2 py-0.5 rounded font-medium">Mặc định</span>
                                            )}
                                            <h4 className="text-[#1f1a14] font-semibold text-base mb-1">{addr.fullName}</h4>
                                            <p className="text-xs text-[#7b6753] mb-3">SĐT: {addr.phone}</p>
                                            <p className="text-xs text-[#1f1a14] leading-relaxed mb-4">{addr.detail}<br />{addr.ward}, {addr.city}</p>

                                            <div className="flex gap-4 text-xs border-t border-[#e7dccb]/50 pt-3">
                                                <button
                                                    onClick={() => setAddressForm({ isOpen: true, id: addr._id, fullName: addr.fullName, phone: addr.phone, city: addr.city, ward: addr.ward, detail: addr.detail, isDefault: addr.isDefault })}
                                                    className="text-[#b8935f] hover:underline"
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                {!addr.isDefault && (
                                                    <>
                                                        <button onClick={() => handleSetDefaultAddress(addr._id)} className="text-[#7b6753] hover:text-[#1f1a14] hover:underline">Cài mặc định</button>
                                                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:underline ml-auto">Xóa bỏ</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* MODAL HỦY ĐƠN HÀNG (QUY TẮC PHẢI NHẬP LÝ DO HỦY) */}
            {cancelModal.isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
                    <div className="bg-white border border-[#e7dccb] w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
                        <h3 className="font-serif text-lg text-[#1f1a14] font-normal tracking-wide">Lý do hủy đơn hàng</h3>
                        <p className="text-xs text-[#7b6753] leading-relaxed">Để giúp OLDMAN nâng cao chất lượng dịch vụ, xin bạn vui lòng để lại lý do hủy bỏ thiết kế này.</p>
                        <textarea
                            rows={3} required placeholder="Nhập lý do hủy đơn hàng cụ thể tại đây..."
                            className="w-full border border-[#e7dccb] rounded-xl p-3 text-sm focus:outline-none focus:border-[#b8935f] resize-none"
                            value={cancelModal.reason} onChange={e => setCancelModal({ ...cancelModal, reason: e.target.value })}
                        />
                        <div className="flex justify-end gap-2 text-xs font-serif font-semibold">
                            <button onClick={() => setCancelModal({ isOpen: false, orderId: null, reason: '' })} className="px-4 py-2.5 border border-[#e7dccb] rounded-lg text-[#7b6753] uppercase tracking-wide">Quay lại</button>
                            <button onClick={handleConfirmCancelOrder} className="px-4 py-2.5 bg-red-600 text-white rounded-lg uppercase tracking-wide hover:bg-red-700">Xác nhận hủy</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}