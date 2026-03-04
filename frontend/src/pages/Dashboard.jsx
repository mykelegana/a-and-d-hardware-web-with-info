import { useState, useEffect } from 'react';
import api from '../api';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  Archive,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const monthNames = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatPeso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const chartData = data.monthlySales?.map((m) => ({
    month: monthNames[m.month],
    Sales: m.totalSales,
    Profit: m.totalProfit,
  })) || [];

  return (
    <>
      {/* Sales Report Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon sales">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <div className="stat-value">{formatPeso(data.totalSales)}</div>
            <div className="stat-label">{data.totalTransactions} transactions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon profit">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Profit</h3>
            <div className="stat-value">{formatPeso(data.totalProfit)}</div>
            <div className="stat-label">Unit Expense: {formatPeso(data.totalCost)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <div className="stat-value">{data.totalProducts}</div>
            <div className="stat-label">Total Stock: {Number(data.totalStockAvailable || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon alert">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>Low Stock / Sold Out</h3>
            <div className="stat-value">{data.lowStockCount} / {data.soldOutCount}</div>
            <div className="stat-label">Items need restocking</div>
          </div>
        </div>
      </div>

      {/* Inventory Summary + Top 5 Products */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
            <h3><Archive size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Inventory Summary</h3>
          </div>
          <div className="card-body">
            <div className="inventory-summary-grid">
              <div className="inventory-summary-item">
                <span className="inventory-summary-label">Total Stock Available</span>
                <span className="inventory-summary-value">{Number(data.totalStockAvailable || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="inventory-summary-item">
                <span className="inventory-summary-label">Total Inventory Value</span>
                <span className="inventory-summary-value">{formatPeso(data.totalStockValue)}</span>
              </div>
              <div className="inventory-summary-item">
                <span className="inventory-summary-label">Total Low Stock Items</span>
                <span className="inventory-summary-value" style={{ color: 'var(--warning)' }}>{data.lowStockCount}</span>
              </div>
              <div className="inventory-summary-item">
                <span className="inventory-summary-label">Total Sold Out Items</span>
                <span className="inventory-summary-value" style={{ color: 'var(--danger)' }}>{data.soldOutCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products with Highest Units Sold */}
        <div className="card">
          <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
            <h3><ShoppingCart size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Top 5 Products — Highest Units Sold</h3>
          </div>
          <div className="card-body card-body-flush">
            {data.topSellingProducts?.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Code</th>
                      <th>Product Description</th>
                      <th style={{ textAlign: 'right' }}>Units Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSellingProducts.map((p, i) => (
                      <tr key={p.productId}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{i + 1}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.productCode || '—'}</td>
                        <td style={{ fontWeight: 600 }}>{p.productName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{Number(p.totalQuantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No sales recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="card">
        <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
          <h3><BarChart3 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Monthly Sales ({new Date().getFullYear()})</h3>
        </div>
        <div className="card-body">
          {chartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatPeso(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Sales" fill="#B71C1C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>No sales data yet for this year.</p>
            </div>
          )}
        </div>
      </div>

      {/* Replenishment Priority List */}
      <div className="card">
        <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
          <h3><XCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Replenishment Priority List</h3>
        </div>
        <div className="card-body card-body-flush">
          {data.replenishmentList?.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Description</th>
                    <th style={{ textAlign: 'right' }}>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.replenishmentList.map((p) => (
                    <tr key={p.id} className={p.stock <= 0 ? 'row-danger' : 'row-warning'}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {p.productCode}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {Number(p.stock).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        {p.stock <= 0 ? (
                          <span className="badge badge-danger">SOLD OUT</span>
                        ) : (
                          <span className="badge badge-warning">LOW STOCK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>All products are well-stocked!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
