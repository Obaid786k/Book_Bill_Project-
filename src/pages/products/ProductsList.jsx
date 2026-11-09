import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Search, Plus, Download, Upload, X, Package } from 'lucide-react';
import { productService } from '../../services/productService';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { formatCurrency } from '../../utils/gstCalc';
import { ProductForm } from './ProductForm';
import { useToast } from '../../components/feedback/Toast';

export const ProductsList = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  // Dashboard "Add product" opens the form straight away.
  const [isFormOpen, setIsFormOpen] = useState(() => !!location.state?.openNew);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = () => {
    productService.getProducts().then(setProducts)
      .catch(() => toast.error('Could not load products. Please refresh the page.'));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(deleteId);
      setDeleteId(null);
      loadProducts();
    } catch {
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: "Name", accessor: "name", sortable: true },
    { header: "Category", accessor: (row) => row.category || '—', sortable: true },
    { header: "HSN", accessor: (row) => row.hsn || '—', sortable: false },
    { header: "Rate", accessor: (row) => formatCurrency(row.rate), sortable: true },
    { header: "Unit", accessor: "unit", sortable: false },
    { header: "GST %", accessor: (row) => `${row.gp || 0}%`, sortable: true }
  ];

  const actions = (row) => (
    <div className="flex gap-3 justify-end">
      <button 
        className="text-navy hover:text-gold text-sm font-semibold transition-colors"
        onClick={() => handleEdit(row)}
      >
        Edit
      </button>
      <button 
        className="text-red hover:text-red/80 text-sm font-semibold transition-colors"
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        actions={
          <>
            <div className="relative w-full sm:w-48 xl:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-ink3" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full pl-9 pr-3 py-2 border border-bb rounded-md text-sm outline-none focus:border-navy transition-colors bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowPlaceholder(true)}>
              <Upload size={16} /> Import <ComingSoonBadge />
            </Button>
            <Button variant="outline" onClick={() => setShowPlaceholder(true)}>
              <Download size={16} /> Export <ComingSoonBadge />
            </Button>
            <Button variant="primary" onClick={openNew}>
              <Plus size={16} /> Add product
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto">
        <DataTable 
          data={filtered} 
          columns={columns} 
          actions={actions}
          searchable={false}
          emptyState={
            <div className="bg-paper border border-border rounded-lg shadow-sm py-8">
              <EmptyState 
                icon={Package}
                title={search ? "No products found" : "No products added yet"}
                description={search ? "Try a different search term." : "Click 'Add Product' to start building your catalog."}
                actionLabel={!search && "Add Product"}
                onAction={!search ? openNew : undefined}
              />
            </div>
          }
        />
      </div>

      <ProductForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        product={editingProduct}
        onSave={loadProducts}
      />

      {showPlaceholder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="bg-paper rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative h-80">
            <button onClick={() => setShowPlaceholder(false)} className="absolute top-4 right-4 text-ink3 hover:text-ink z-10">
              <X size={20} />
            </button>
            <ComingSoonPanel 
              title="Bulk Data Transfer"
              description="CSV Import and Export features are currently in development. You will soon be able to migrate your catalog in one click."
              onDismiss={() => setShowPlaceholder(false)}
            />
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will not affect existing bills."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductsList;
