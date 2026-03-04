import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';

function formatPeso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function NewSale() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const getProduct = (productId) =>
    products.find((p) => p.id === Number(productId));

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = getProduct(item.productId);
      if (!product) return total;
      return total + Number(product.sellingPrice) * Number(item.quantity || 0);
    }, 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => {
      const product = getProduct(item.productId);
      if (!product) return total;
      return total + Number(product.costPrice) * Number(item.quantity || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = items.filter(
      (item) => item.productId && Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      addToast('Please add at least one item', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/sales', {
        customerName: customerName || undefined,
        notes: notes || undefined,
        items: validItems.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      });
      addToast('Sale recorded successfully!');
      navigate('/sales');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating sale', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = calculateTotal();
  const totalCost = calculateTotalCost();
  const totalProfit = totalAmount - totalCost;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
        {/* Left - Items */}
        <div className="card">
          <div className="card-header">
            <h3>
              <ShoppingCart size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Sale Items
            </h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <Plus size={14} /> Add Item
            </button>
          </div>
          <div className="card-body">
            <div className="sale-items-list">
              {items.map((item, index) => {
                const product = getProduct(item.productId);
                return (
                  <div className="sale-item-row" key={index}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      {index === 0 && <label>Product</label>}
                      <select
                        className="form-input"
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, 'productId', e.target.value)
                        }
                        required
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.productCode}] {p.name} — {formatPeso(p.sellingPrice)} (Stock:{' '}
                            {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      {index === 0 && <label>Qty</label>}
                      <input
                        type="number"
                        min="1"
                        max={product?.stock || 99999}
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, 'quantity', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div style={{ paddingTop: index === 0 ? '1.4rem' : 0 }}>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        style={{
                          padding: '0.55rem',
                          color: items.length === 1 ? 'var(--text-light)' : 'var(--danger)',
                          background: 'none',
                          border: 'none',
                          cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Item breakdown */}
            {items.some((item) => item.productId) && (
              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product Code</th>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((item) => item.productId)
                      .map((item, i) => {
                        const product = getProduct(item.productId);
                        if (!product) return null;
                        const subtotal =
                          Number(product.sellingPrice) * Number(item.quantity || 0);
                        return (
                          <tr key={i}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.productCode || '—'}</td>
                            <td>{product.name}</td>
                            <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>
                              {formatPeso(product.sellingPrice)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                              {formatPeso(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right - Summary & Customer */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <h3>Customer Details</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Customer Name (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Walk-in customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Add notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Order Summary</h3>
            </div>
            <div className="card-body">
              <div className="sale-summary" style={{ background: 'transparent', padding: 0 }}>
                <div className="sale-summary-row">
                  <span>Items:</span>
                  <span>{items.filter((i) => i.productId).length}</span>
                </div>
                <div className="sale-summary-row">
                  <span>Total Cost:</span>
                  <span>{formatPeso(totalCost)}</span>
                </div>
                <div className="sale-summary-row">
                  <span>Total Amount:</span>
                  <span style={{ fontWeight: 600 }}>{formatPeso(totalAmount)}</span>
                </div>
                <div className="sale-summary-row total">
                  <span>Profit:</span>
                  <span>{formatPeso(totalProfit)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
                disabled={submitting || !items.some((i) => i.productId)}
              >
                {submitting ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <ShoppingCart size={16} /> Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
