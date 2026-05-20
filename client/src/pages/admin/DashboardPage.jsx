import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { 
  Users, ShoppingBag, DollarSign, Package, AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#eab308', '#3b82f6', '#a855f7', '#6366f1', '#22c55e', '#ef4444', '#6b7280'];
const STATUS_NAMES = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Refunded'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatCompactNumber = (number) => {
  if (number >= 1e9) return (number / 1e9).toFixed(1) + 'B';
  if (number >= 1e6) return (number / 1e6).toFixed(1) + 'M';
  if (number >= 1e3) return (number / 1e3).toFixed(1) + 'K';
  return number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartRes, topRes, stockRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRevenueChart(new Date().getFullYear()),
          adminApi.getTopProducts(5),
          adminApi.getLowStock(10)
        ]);
        
        setStats(statsRes?.data || { totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0, today: { orders: 0, revenue: 0 }, ordersByStatus: {} });
        setChartData(chartRes?.data || []);
        setTopProducts(topRes?.data || []);
        setLowStock(stockRes?.data || []);
      } catch (error) {
        console.error('Lỗi tải Dashboard', error);
        // Fallback an toàn nếu API lỗi hoàn toàn
        setStats({ totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0, today: { orders: 0, revenue: 0 }, ordersByStatus: {} });
        setChartData([]);
        setTopProducts([]);
        setLowStock([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg shadow-sm"></div>)}
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg shadow-sm"></div>
      </div>
    );
  }

  const pieData = STATUS_NAMES.map(status => ({
    name: status,
    value: stats?.ordersByStatus?.[status] || 0
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Báo Cáo Tổng Quan</h1>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Khách Hàng" value={stats?.totalUsers || 0} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} title="Tổng Đơn Hàng" value={stats?.totalOrders || 0} sub={`Hôm nay: +${stats?.today?.orders || 0}`} color="bg-purple-500" />
        <StatCard icon={DollarSign} title="Doanh Thu" value={formatCurrency(stats?.totalRevenue || 0)} sub={`Hôm nay: +${formatCurrency(stats?.today?.revenue || 0)}`} color="bg-green-500" />
        <StatCard icon={Package} title="Sản Phẩm Active" value={stats?.totalProducts || 0} color="bg-amber-500" />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ doanh thu {new Date().getFullYear()}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis tickFormatter={formatCompactNumber} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Trạng thái đơn hàng</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-gray-400">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[STATUS_NAMES.indexOf(entry.name)]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sản Phẩm Bán Chạy Trứ Danh</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                  <th className="px-4 py-3 font-semibold text-right">Đã bán</th>
                  <th className="px-4 py-3 font-semibold text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu bán hàng.</td></tr>
                ) : (
                  topProducts.map((p, i) => (
                    <tr key={p._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 flex items-center">
                        <span className="text-gray-400 mr-3 font-medium">#{i+1}</span>
                        <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-md object-cover mr-3 shadow-sm" alt="" />
                        <span className="font-semibold text-gray-800 truncate max-w-[180px]">{p.name || 'Sản phẩm lỗi'}</span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">{p.totalSold || 0}</td>
                      <td className="px-4 py-4 text-right text-primary-600 font-bold">{formatCompactNumber(p.totalRevenue || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <AlertTriangle className="text-amber-500 mr-2" size={20} />
              Cảnh Báo Tồn Kho
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                  <th className="px-4 py-3 font-semibold text-right">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 flex items-center">
                      <img src={p.images?.[0]?.url} className="w-10 h-10 rounded-md object-cover mr-3 shadow-sm" alt="" />
                      <span className="font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.totalStock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.totalStock === 0 ? 'Hết hàng' : p.totalStock}
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan="2" className="px-4 py-8 text-center text-gray-500">Kho hàng ổn định, không có cảnh báo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, sub, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-shadow cursor-pointer">
      <div className={`p-4 rounded-xl ${color} text-white mr-4 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        {sub && <p className="text-xs text-green-600 mt-1 font-semibold">{sub}</p>}
      </div>
    </div>
  );
}
