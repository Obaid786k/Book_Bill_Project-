import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirmDialog';

export const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = () => {
    productService.getCategories().then(setCategories);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim() || isAdding) return;
    setIsAdding(true);
    try {
      await productService.saveCategory({ name: newCat.trim() });
      setNewCat('');
      loadCategories();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);
    try {
      await productService.deleteCategory(deleteId);
      setDeleteId(null);
      loadCategories();
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: "Category Name", accessor: "name", sortable: true },
    { header: "ID", accessor: "id", sortable: false }
  ];

  const actions = (row) => (
    <div className="flex justify-end">
      <button 
        className="text-rose hover:text-rose/80 text-sm font-semibold transition-colors"
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Categories</h1>
        <p className="text-sm text-ink2 mt-1">Organize your products and services.</p>
      </div>

      <div className="bg-paper border border-border rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input 
            type="text" 
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g. Beverages, Electronics"
            className="flex-1 border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors"
          />
          <Button variant="primary" type="submit" isLoading={isAdding}>Add Category</Button>
        </form>
      </div>

      <div className="flex-1">
        <DataTable 
          data={categories} 
          columns={columns} 
          actions={actions}
          emptyMessage="No categories found."
        />
      </div>

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CategoryManager;
