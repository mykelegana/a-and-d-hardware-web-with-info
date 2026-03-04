import { useState } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatPeso(amount) {
  return Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Reports() {
  const { addToast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [exporting, setExporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch report data + all products for complete list
      const [reportRes, productsRes] = await Promise.all([
        api.get(`/sales/report/${year}/${month}`),
        api.get('/products'),
      ]);

      const report = reportRes.data;
      const allProducts = productsRes.data;
      const daysInMonth = report.daysInMonth;

      // Build a map of products that have sales
      const soldMap = {};
      for (const p of report.products) {
        soldMap[p.productCode] = p;
      }

      // Build rows for ALL products (like the CSV)
      const rows = [];
      let grandTotalQty = 0;
      let grandTotalSales = 0;
      let grandTotalProfit = 0;

      // Sort all products by name
      const sortedProducts = [...allProducts].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      for (const prod of sortedProducts) {
        const sold = soldMap[prod.productCode];
        const row = {
          'Item Code': prod.productCode || '',
          'Quantity': Number(prod.beginningStock || 0),
          'Balance Qty': Number(prod.stock || 0),
          'Item Description': prod.name,
          'Unit Price': Number(prod.costPrice || 0),
          'Selling Price': Number(prod.sellingPrice || 0),
          'Unit': prod.unit || '',
        };

        // Add daily columns
        let totalQty = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const dayLabel = String(d).padStart(2, '0') + '-' + monthNames[month].substring(0, 3);
          const daySales = sold?.dailySales?.[d] || 0;
          row[dayLabel] = daySales || '';
          totalQty += daySales;
        }

        const totalSales = totalQty * Number(prod.sellingPrice || 0);
        const totalProfit = totalQty * (Number(prod.sellingPrice || 0) - Number(prod.costPrice || 0));

        row['QTY.'] = totalQty;
        row['TOTAL SALES'] = totalSales;
        row['TOTAL PROFIT'] = totalProfit;

        rows.push(row);
        grandTotalQty += totalQty;
        grandTotalSales += totalSales;
        grandTotalProfit += totalProfit;
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      // Set column widths
      const colWidths = [
        { wch: 14 }, // Item Code
        { wch: 10 }, // Quantity
        { wch: 10 }, // Balance Qty
        { wch: 40 }, // Item Description
        { wch: 12 }, // Unit Price
        { wch: 12 }, // Selling Price
        { wch: 8 },  // Unit
      ];
      for (let d = 1; d <= daysInMonth; d++) {
        colWidths.push({ wch: 7 }); // Day columns
      }
      colWidths.push({ wch: 8 });  // QTY.
      colWidths.push({ wch: 14 }); // TOTAL SALES
      colWidths.push({ wch: 14 }); // TOTAL PROFIT
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, `Sales ${monthNames[month]} ${year}`);

      // Generate filename
      const filename = `A&D_Hardware_Sales_${monthNames[month]}_${year}.xlsx`;
      XLSX.writeFile(wb, filename);

      setPreviewData({
        totalProducts: sortedProducts.length,
        productsWithSales: report.products.length,
        grandTotalQty,
        grandTotalSales,
        grandTotalProfit,
      });

      addToast(`Report exported: ${filename}`);
    } catch (err) {
      console.error(err);
      addToast('Error generating report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportInventory = async () => {
    setExporting(true);
    try {
      const res = await api.get('/products');
      const products = res.data;

      const rows = products
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p, i) => ({
          '#': i + 1,
          'Product Code': p.productCode || '',
          'Product Description': p.name,
          'Unit': p.unit || '',
          'Cost Price': Number(p.costPrice || 0),
          'Selling Price': Number(p.sellingPrice || 0),
          'Beginning Stock': Number(p.beginningStock || 0),
          'Current Stock': Number(p.stock || 0),
          'Status': Number(p.stock) <= 0 ? 'SOLD OUT' : Number(p.stock) <= Number(p.lowStockThreshold) ? 'LOW STOCK' : 'IN STOCK',
          'Stock Value (Cost)': Number(p.stock || 0) * Number(p.costPrice || 0),
          'Stock Value (Retail)': Number(p.stock || 0) * Number(p.sellingPrice || 0),
        }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 5 }, { wch: 14 }, { wch: 40 }, { wch: 8 },
        { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
        { wch: 12 }, { wch: 16 }, { wch: 16 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

      const filename = `A&D_Hardware_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
      addToast(`Inventory exported: ${filename}`);
    } catch (err) {
      console.error(err);
      addToast('Error exporting inventory', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Monthly Sales Report */}
        <div className="card">
          <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
            <h3>
              <FileSpreadsheet size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Monthly Sales Report
            </h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Export daily sales breakdown per product (same format as your Excel sales sheet).
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label>Year</label>
                <input
                  type="number"
                  className="form-input"
                  min="2020"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label>Month</label>
                <select
                  className="form-input"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {monthNames.slice(1).map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <span className="spinner" />
              ) : (
                <>
                  <Download size={16} /> Export Sales Report
                </>
              )}
            </button>

            {previewData && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'var(--bg-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Last Export Summary:</div>
                <div>Total Products: {previewData.totalProducts}</div>
                <div>Products with Sales: {previewData.productsWithSales}</div>
                <div>Total Qty Sold: {previewData.grandTotalQty.toLocaleString()}</div>
                <div>Total Sales: ₱{formatPeso(previewData.grandTotalSales)}</div>
                <div>Total Profit: ₱{formatPeso(previewData.grandTotalProfit)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Export */}
        <div className="card">
          <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
            <h3>
              <FileSpreadsheet size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Inventory Report
            </h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Export current inventory with stock levels, values, and status for all products.
            </p>
            <div style={{ padding: '1rem 0' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div>Includes all product details</div>
                <div>Stock status indicators</div>
                <div>Cost &amp; retail values</div>
                <div>Beginning &amp; current stock</div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleExportInventory}
              disabled={exporting}
            >
              {exporting ? (
                <span className="spinner" />
              ) : (
                <>
                  <Download size={16} /> Export Inventory Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
