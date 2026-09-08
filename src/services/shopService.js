import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { handleSupabaseError } from '../utils/handleSupabaseError';

const DEFAULT_SHOP = {
  shopName: "",
  tagline: "",
  shopAddress: "",
  shopPhone: "",
  shopEmail: "",
  shopGstin: "",
  shopState: "",
  payMode: "Cash",
  upiId: "",
  bankAcc: "",
  ifsc: "",
  defaultTaxType: "inclusive",
  defaultTerms: "1. Goods once sold will not be taken back or exchanged.\n2. Subject to local jurisdiction."
};

// Maps a `businesses` row (snake_case, DB shape) to the flat camelCase
// shape every page already expects — so no page needs to change.
const toShopShape = (row) => ({
  shopName: row.business_name,
  tagline: row.tagline,
  shopAddress: row.address,
  shopPhone: row.phone,
  shopEmail: row.email,
  shopGstin: row.gstin,
  shopState: row.state,
  payMode: row.pay_mode,
  upiId: row.upi_id,
  bankAcc: row.bank_acc,
  ifsc: row.ifsc,
  defaultTaxType: row.default_tax_type,
  defaultTerms: row.default_terms,
});

const toDbShape = (data) => {
  const map = {
    shopName: 'business_name',
    tagline: 'tagline',
    shopAddress: 'address',
    shopPhone: 'phone',
    shopEmail: 'email',
    shopGstin: 'gstin',
    shopState: 'state',
    payMode: 'pay_mode',
    upiId: 'upi_id',
    bankAcc: 'bank_acc',
    ifsc: 'ifsc',
    defaultTaxType: 'default_tax_type',
    defaultTerms: 'default_terms',
    hasCompletedSetup: 'has_completed_setup',
  };
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (map[key]) out[map[key]] = value;
  }
  return out;
};

export const shopService = {
  getProfile: async () => {
    const businessId = useAuthStore.getState().user?.businessId;
    if (!businessId) return { ...DEFAULT_SHOP };

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('[shopService] getProfile failed:', error);
      return { ...DEFAULT_SHOP };
    }
    if (!data) return { ...DEFAULT_SHOP };
    return toShopShape(data);
  },

  // Used by the onboarding wizard for its FIRST save (no business row
  // exists yet) and by later Settings saves (business row already exists).
  saveProfile: async (data) => {
    const state = useAuthStore.getState();
    const businessId = state.user?.businessId;
    const dbData = toDbShape(data);

    if (!businessId) {
      throw new Error('Business profile missing. The signup database trigger may have failed.');
    }

    const { data: updated, error } = await supabase
      .from('businesses')
      .update(dbData)
      .eq('id', businessId)
      .select()
      .single();
      
    if (error) throw handleSupabaseError(error, { table: 'businesses', action: 'saveProfile' });
    return toShopShape(updated);
  }
};
