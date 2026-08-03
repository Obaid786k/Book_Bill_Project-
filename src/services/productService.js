const LS_PRODUCTS = "ig_prod_v1";
const LS_CATEGORIES = "ig_cat_v1";

const SEED_CATEGORIES = [
  { id: 'c1', name: 'Groceries' },
  { id: 'c2', name: 'Pharmacy' },
  { id: 'c3', name: 'Services' },
  { id: 'c4', name: 'Digital Services' }
];

const SEED_PRODUCTS = [
  { id: 'p1', name: 'Paracetamol 500mg (Strip of 10)', category: 'Pharmacy', rate: 25, unit: 'Strip', hsn: '3004', gp: '12' },
  { id: 'p2', name: 'Aashirvaad Atta 5kg', category: 'Groceries', rate: 220, unit: 'Bag', hsn: '1101', gp: '5' },
  { id: 'p3', name: 'Amul Butter 500g', category: 'Groceries', rate: 275, unit: 'Box', hsn: '0405', gp: '12' },
  { id: 'p4', name: 'Consultation Fee', category: 'Services', rate: 500, unit: 'Session', hsn: '9983', gp: '18' },
  { id: 'p5', name: 'Website Development', category: 'Digital Services', rate: 15000, unit: 'Project', hsn: '9983', gp: '18' },
  { id: 'p6', name: 'SEO Optimization (Monthly)', category: 'Digital Services', rate: 5000, unit: 'Month', hsn: '9983', gp: '18' },
  { id: 'p7', name: 'Maggi Noodles 280g', category: 'Groceries', rate: 55, unit: 'Pack', hsn: '1902', gp: '18' },
  { id: 'p8', name: 'Tata Salt 1kg', category: 'Groceries', rate: 25, unit: 'Bag', hsn: '2501', gp: '0' },
  { id: 'p9', name: 'Dettol Handwash 200ml', category: 'Groceries', rate: 99, unit: 'Bottle', hsn: '3401', gp: '18' },
  { id: 'p10', name: 'Plumbing Service', category: 'Services', rate: 300, unit: 'Hour', hsn: '9954', gp: '18' },
  { id: 'p11', name: 'Electrical Repair', category: 'Services', rate: 250, unit: 'Hour', hsn: '9954', gp: '18' },
  { id: 'p12', name: 'Laptop Servicing', category: 'Services', rate: 800, unit: 'Service', hsn: '9987', gp: '18' }
];

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  // ----- PRODUCTS -----
  getProducts: async () => {
    await delay();
    return productService.getProductsSync();
  },

  saveProduct: async (product) => {
    await delay();
    let prods = productService.getProductsSync();
    
    if (product.id) {
      const idx = prods.findIndex(p => p.id === product.id);
      if (idx >= 0) prods[idx] = { ...prods[idx], ...product };
      else prods.unshift(product);
    } else {
      prods.unshift({ ...product, id: `p${Date.now()}` });
    }
    
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(prods));
    return prods;
  },

  deleteProduct: async (id) => {
    await delay();
    let prods = productService.getProductsSync();
    prods = prods.filter(p => p.id !== id);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(prods));
    return prods;
  },

  getProductsSync: () => {
    try {
      const p = localStorage.getItem(LS_PRODUCTS);
      if (!p) {
        localStorage.setItem(LS_PRODUCTS, JSON.stringify(SEED_PRODUCTS));
        return [...SEED_PRODUCTS];
      }
      return JSON.parse(p);
    } catch {
      return [];
    }
  },

  // ----- CATEGORIES -----
  getCategories: async () => {
    await delay();
    return productService.getCategoriesSync();
  },

  saveCategory: async (category) => {
    await delay();
    let cats = productService.getCategoriesSync();
    
    if (category.id) {
      const idx = cats.findIndex(c => c.id === category.id);
      if (idx >= 0) cats[idx] = { ...cats[idx], ...category };
    } else {
      cats.unshift({ ...category, id: `c${Date.now()}` });
    }
    
    localStorage.setItem(LS_CATEGORIES, JSON.stringify(cats));
    return cats;
  },

  deleteCategory: async (id) => {
    await delay();
    let cats = productService.getCategoriesSync();
    cats = cats.filter(c => c.id !== id);
    localStorage.setItem(LS_CATEGORIES, JSON.stringify(cats));
    return cats;
  },

  getCategoriesSync: () => {
    try {
      const c = localStorage.getItem(LS_CATEGORIES);
      if (!c) {
        localStorage.setItem(LS_CATEGORIES, JSON.stringify(SEED_CATEGORIES));
        return [...SEED_CATEGORIES];
      }
      return JSON.parse(c);
    } catch {
      return [];
    }
  }
};
