import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Eye,
  X,
  ShoppingCart,
  Calendar,
  Download,
} from 'lucide-react';

function formatPeso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Sales() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewingSale, setViewingSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/sales', { params });
      setSales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchSales();
  };

  const handleVoidSale = async (sale) => {
    if (
      !confirm(
        `Void sale #${sale.saleNumber}? This will restore the stock for all items.`,
      )
    )
      return;
    try {
      await api.delete(`/sales/${sale.id}`);
      addToast('Sale voided and stock restored');
      fetchSales();
    } catch (err) {
      addToast('Error voiding sale', 'error');
    }
  };

  const viewSaleDetails = async (sale) => {
    try {
      const res = await api.get(`/sales/${sale.id}`);
      setViewingSale(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Compute summary
  const totalSales = sales.reduce((s, sale) => s + Number(sale.totalAmount), 0);
  const totalProfit = sales.reduce((s, sale) => s + Number(sale.profit), 0);

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span style={{ color: 'var(--text-secondary)' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleFilter}>
              Filter
            </button>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* Summary Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-white)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          fontSize: '0.875rem',
        }}
      >
        <div>
          Showing <strong>{sales.length}</strong> transactions
        </div>
        <div>
          Total Sales: <strong style={{ color: 'var(--primary)' }}>{formatPeso(totalSales)}</strong>
        </div>
        <div>
          Total Profit: <strong style={{ color: 'var(--success)' }}>{formatPeso(totalProfit)}</strong>
        </div>
      </div>

      <div className="card">
        <div className="card-body card-body-flush">
          {loading ? (
            <div className="empty-state">
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : sales.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={48} />
              <h3>No sales recorded</h3>
              <p>Start by creating a new sale.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Sale #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Cost</th>
                    <th style={{ textAlign: 'right' }}>Profit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td style={{ fontWeight: 600 }}>#{sale.saleNumber}</td>
                      <td>{formatDate(sale.saleDate)}</td>
                      <td>{sale.customerName || 'Walk-in'}</td>
                      <td>
                        <span className="badge badge-info">
                          {sale.items?.length || 0} items
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                        }}
                      >
                        {formatPeso(sale.totalAmount)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {formatPeso(sale.totalCost)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--success)',
                        }}
                      >
                        {formatPeso(sale.profit)}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-icon"
                            onClick={() => viewSaleDetails(sale)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleVoidSale(sale)}
                            title="Void Sale"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      {viewingSale && (
        <div className="modal-overlay" onClick={() => setViewingSale(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sale #{viewingSale.saleNumber} Details</h2>
              <button className="btn-icon" onClick={() => setViewingSale(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <strong>Customer:</strong>{' '}
                  {viewingSale.customerName || 'Walk-in'}
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(viewingSale.saleDate)}
                </div>
                {viewingSale.notes && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <strong>Notes:</strong> {viewingSale.notes}
                  </div>
                )}
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product Code</th>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                      <th style={{ textAlign: 'right' }}>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingSale.items?.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {item.product?.productCode || '—'}
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {item.product?.name || `Product #${item.productId}`}
                        </td>
                        <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>
                          {formatPeso(item.unitPrice)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatPeso(item.subtotal)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: 'var(--success)',
                            fontWeight: 600,
                          }}
                        >
                          {formatPeso(item.itemProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sale-summary">
                <div className="sale-summary-row">
                  <span>Total Cost:</span>
                  <span>{formatPeso(viewingSale.totalCost)}</span>
                </div>
                <div className="sale-summary-row">
                  <span>Total Amount:</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatPeso(viewingSale.totalAmount)}
                  </span>
                </div>
                <div className="sale-summary-row total">
                  <span>Net Profit:</span>
                  <span>{formatPeso(viewingSale.profit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
