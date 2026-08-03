const LS_SHOP_PROFILE = "ig_shop_profile_v1";

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_SHOP = {
  shopName: "",
  tagline: "",
  shopAddress: "",
  shopPhone: "",
  shopEmail: "",
  shopGstin: "",
  shopState: "Uttar Pradesh", // Or empty string, but UP is default in reference
  payMode: "Cash",
  upiId: "",
  bankAcc: "",
  ifsc: "",
  defaultTaxType: "inclusive",
  defaultTerms: "1. Goods once sold will not be taken back or exchanged.\n2. Subject to local jurisdiction."
};

export const shopService = {
  getProfile: async () => {
    await delay(300);
    return shopService.getProfileSync();
  },

  getProfileSync: () => {
    try {
      const p = localStorage.getItem(LS_SHOP_PROFILE);
      if (p) return JSON.parse(p);
      return { ...DEFAULT_SHOP };
    } catch {
      return { ...DEFAULT_SHOP };
    }
  },

  saveProfile: async (data) => {
    await delay(600); // Simulate network
    const current = shopService.getProfileSync();
    const updated = { ...current, ...data };
    localStorage.setItem(LS_SHOP_PROFILE, JSON.stringify(updated));
    return updated;
  }
};
