import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Download,
} from 'lucide-react';

function formatPeso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const emptyProduct = {
  productCode: '',
  name: '',
  sku: '',
  description: '',
  unit: 'pc',
  costPrice: '',
  sellingPrice: '',
  beginningStock: '',
  stock: '',
  lowStockThreshold: '5',
  categoryId: '',
};

export default function Products() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.productCode && p.productCode.toLowerCase().includes(search.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      !filterCategory || p.categoryId === Number(filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Summary stats for filtered products
  const summaryStats = {
    totalProducts: filteredProducts.length,
    totalStock: filteredProducts.reduce((s, p) => s + Number(p.stock), 0),
    totalValue: filteredProducts.reduce(
      (s, p) => s + Number(p.stock) * Number(p.costPrice),
      0,
    ),
    totalRetailValue: filteredProducts.reduce(
      (s, p) => s + Number(p.stock) * Number(p.sellingPrice),
      0,
    ),
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      productCode: product.productCode || '',
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      unit: product.unit || 'pc',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      beginningStock: product.beginningStock,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      categoryId: product.categoryId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        beginningStock: Number(form.beginningStock || form.stock),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        addToast('Product updated successfully');
      } else {
        await api.post('/products', payload);
        addToast('Product added successfully');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      addToast('Product deleted');
      fetchProducts();
    } catch (err) {
      addToast('Error deleting product', 'error');
    }
  };

  const getStockBadge = (product) => {
    if (Number(product.stock) <= 0) return <span className="badge badge-danger">Sold Out</span>;
    if (Number(product.stock) <= Number(product.lowStockThreshold))
      return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  };

  // Compute stock movement: stockIn = max(0, stock - beginningStock), stockOut = max(0, beginningStock - stock)
  const getStockMovement = (p) => {
    const beginning = Number(p.beginningStock) || 0;
    const current = Number(p.stock) || 0;
    const diff = current - beginning;
    return {
      stockIn: diff > 0 ? diff : 0,
      stockOut: diff < 0 ? Math.abs(diff) : 0,
    };
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <Search />
            <input
              type="text"
              placeholder="Search by name or product code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Inventory Summary Bar */}
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
          flexWrap: 'wrap',
        }}
      >
        <div>
          Products: <strong>{summaryStats.totalProducts}</strong>
        </div>
        <div>
          Total Stock: <strong>{summaryStats.totalStock.toLocaleString()}</strong>
        </div>
        <div>
          Inventory Value: <strong style={{ color: 'var(--primary)' }}>{formatPeso(summaryStats.totalValue)}</strong>
        </div>
        <div>
          Retail Value: <strong style={{ color: 'var(--success)' }}>{formatPeso(summaryStats.totalRetailValue)}</strong>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
          <h3><Package size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />A&D Inventory</h3>
        </div>
        <div className="card-body card-body-flush">
          {loading ? (
            <div className="empty-state">
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No products found</h3>
              <p>Add your first product to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Description</th>
                    <th>Unit</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Selling Price</th>
                    <th style={{ textAlign: 'right' }}>Beginning Stock</th>
                    <th style={{ textAlign: 'right' }}>Stock In</th>
                    <th style={{ textAlign: 'right' }}>Stock Out</th>
                    <th style={{ textAlign: 'right' }}>Ending Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const { stockIn, stockOut } = getStockMovement(p);
                    return (
                      <tr key={p.id} className={Number(p.stock) <= 0 ? 'row-danger' : Number(p.stock) <= Number(p.lowStockThreshold) ? 'row-warning' : ''}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                          {p.productCode || '—'}
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.unit || '—'}</td>
                        <td style={{ textAlign: 'right' }}>{formatPeso(p.costPrice)}</td>
                        <td style={{ textAlign: 'right' }}>{formatPeso(p.sellingPrice)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {Number(p.beginningStock || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: stockIn > 0 ? 'var(--success)' : 'var(--text-light)' }}>
                          {stockIn > 0 ? '+' + stockIn.toLocaleString('en-PH', { maximumFractionDigits: 2 }) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', color: stockOut > 0 ? 'var(--danger)' : 'var(--text-light)' }}>
                          {stockOut > 0 ? '-' + stockOut.toLocaleString('en-PH', { maximumFractionDigits: 2 }) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {Number(p.stock).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                        </td>
                        <td>{getStockBadge(p)}</td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="btn-icon"
                              onClick={() => openEditModal(p)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDelete(p)}
                              title="Delete"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CON-CMT-001"
                      value={form.productCode}
                      onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-input"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      className="form-input"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      <option value="pc">Piece (pc)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="meter">Meter</option>
                      <option value="roll">Roll</option>
                      <option value="bag">Bag</option>
                      <option value="box">Box</option>
                      <option value="gal">Gallon</option>
                      <option value="set">Set</option>
                      <option value="pair">Pair</option>
                      <option value="bundle">Bundle</option>
                      <option value="liter">Liter</option>
                      <option value="sheet">Sheet</option>
                      <option value="length">Length</option>
                      <option value="can">Can</option>
                      <option value="pack">Pack</option>
                      <option value="jar">Jar</option>
                      <option value="tube">Tube</option>
                      <option value="bottle">Bottle</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cost Price (₱) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={form.costPrice}
                      onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₱) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={form.sellingPrice}
                      onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Beginning Stock</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={form.beginningStock}
                      onChange={(e) => setForm({ ...form, beginningStock: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Stock *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={form.lowStockThreshold}
                      onChange={(e) =>
                        setForm({ ...form, lowStockThreshold: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>SKU (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {form.costPrice && form.sellingPrice && (
                  <div className="sale-summary" style={{ marginTop: '0.5rem' }}>
                    <div className="sale-summary-row">
                      <span>Profit per unit:</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {formatPeso(Number(form.sellingPrice) - Number(form.costPrice))}
                      </span>
                    </div>
                    <div className="sale-summary-row">
                      <span>Margin:</span>
                      <span>
                        {Number(form.sellingPrice) > 0
                          ? (
                              ((Number(form.sellingPrice) - Number(form.costPrice)) /
                                Number(form.sellingPrice)) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
