import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { handleSupabaseError } from '../utils/handleSupabaseError';

const getBusinessId = () => useAuthStore.getState().user?.businessId;

const toProductShape = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  rate: row.rate,
  unit: row.unit,
  hsn: row.hsn,
  gp: String(row.gst_rate),
});

const toCategoryShape = (row) => ({ id: row.id, name: row.name });

export const productService = {
  // ----- PRODUCTS -----
  getProducts: async () => {
    const businessId = getBusinessId();
    if (!businessId) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error, { table: 'products', action: 'select' });
    return data.map(toProductShape);
  },

  saveProduct: async (product) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');

    const dbFields = {
      name: product.name,
      category: product.category || '',
      rate: parseFloat(product.rate) || 0,
      unit: product.unit || 'Pcs',
      hsn: product.hsn || '',
      gst_rate: parseFloat(product.gp) || 0,
    };

    if (product.id) {
      const { error } = await supabase
        .from('products')
        .update(dbFields)
        .eq('id', product.id)
        .eq('business_id', businessId);
      if (error) throw handleSupabaseError(error, { table: 'products', action: 'update' });
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ business_id: businessId, ...dbFields });
      if (error) throw handleSupabaseError(error, { table: 'products', action: 'insert' });
    }

    return productService.getProducts();
  },

  deleteProduct: async (id) => {
    const businessId = getBusinessId();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);
    if (error) throw handleSupabaseError(error, { table: 'products', action: 'delete' });
    return productService.getProducts();
  },

  // ----- CATEGORIES -----
  getCategories: async () => {
    const businessId = getBusinessId();
    if (!businessId) return [];
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });
    if (error) throw handleSupabaseError(error, { table: 'categories', action: 'select' });
    return data.map(toCategoryShape);
  },

  saveCategory: async (category) => {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business found for current user');

    if (category.id) {
      const { error } = await supabase
        .from('categories')
        .update({ name: category.name })
        .eq('id', category.id)
        .eq('business_id', businessId);
      if (error) throw handleSupabaseError(error, { table: 'categories', action: 'update' });
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ business_id: businessId, name: category.name });
      if (error) throw handleSupabaseError(error, { table: 'categories', action: 'insert' });
    }

    return productService.getCategories();
  },

  deleteCategory: async (id) => {
    const businessId = getBusinessId();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);
    if (error) throw handleSupabaseError(error, { table: 'categories', action: 'delete' });
    return productService.getCategories();
  }
};
