const delay = (ms) => new Promise(res => setTimeout(res, ms));

const STORAGE_KEY = 'bb_settings_mock';

// Default values for all settings
const defaultSettings = {
  // Business Profile
  shopName: '',
  tagline: '',
  shopAddress: '',
  shopState: '',
  shopPhone: '',
  shopEmail: '',
  
  defaultTaxType: 'inclusive',
  defaultCopyType: 'original',
  invoiceSequence: 'INV-0001',
  defaultTerms: '1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged if payment is delayed.',
  
  // GST Settings
  shopGstin: '',
  defaultHsnBehavior: 'optional', // optional, mandatory, auto
  
  // Payment Settings
  payMode: 'Cash',
  upiId: '',
  bankAcc: '',
  ifsc: '',
  
  // Notification Settings
  emailAlerts: true,
  smsAlerts: false,
  dailySummary: true,
  stockAlerts: true,
};

// Helper to get current mock settings
const getSettings = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return { ...defaultSettings };
};

// Helper to save mock settings
const saveSettings = (data) => {
  const current = getSettings();
  const next = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

// Expose grouped APIs mimicking a real backend
export const settingsService = {
  // Business Profile
  getBusinessProfile: async () => {
    await delay(400);
    const { shopName, tagline, shopAddress, shopState, shopPhone, shopEmail } = getSettings();
    return { shopName, tagline, shopAddress, shopState, shopPhone, shopEmail };
  },
  saveBusinessProfile: async (data) => {
    await delay(600); // Simulate network latency
    saveSettings(data);
    return true;
  },

  // Invoice Preferences
  getInvoicePreferences: async () => {
    await delay(400);
    const { defaultTaxType, defaultCopyType, defaultTerms, invoiceSequence } = getSettings();
    return { defaultTaxType, defaultCopyType, defaultTerms, invoiceSequence };
  },
  saveInvoicePreferences: async (data) => {
    await delay(600);
    saveSettings(data);
    return true;
  },
  incrementInvoiceSequence: async () => {
    const current = getSettings();
    if (!current.invoiceSequence) return;
    const nextSeq = String(current.invoiceSequence).replace(/(\d+)$/, match => String(+match + 1).padStart(match.length, "0"));
    saveSettings({ invoiceSequence: nextSeq });
    return nextSeq;
  },

  // GST Settings
  getGSTSettings: async () => {
    await delay(400);
    const { shopGstin, defaultHsnBehavior } = getSettings();
    return { shopGstin, defaultHsnBehavior };
  },
  saveGSTSettings: async (data) => {
    await delay(600);
    saveSettings(data);
    return true;
  },

  // Payment Settings
  getPaymentSettings: async () => {
    await delay(400);
    const { payMode, upiId, bankAcc, ifsc } = getSettings();
    return { payMode, upiId, bankAcc, ifsc };
  },
  savePaymentSettings: async (data) => {
    await delay(600);
    saveSettings(data);
    return true;
  },

  // Notification Settings
  getNotificationSettings: async () => {
    await delay(400);
    const { emailAlerts, smsAlerts, dailySummary, stockAlerts } = getSettings();
    return { emailAlerts, smsAlerts, dailySummary, stockAlerts };
  },
  saveNotificationSettings: async (data) => {
    await delay(600);
    saveSettings(data);
    return true;
  },

  // Security Settings (Mock only, no localstorage persistence for passwords)
  changePassword: async (oldPassword, newPassword) => {
    await delay(800);
    // Always succeed in mock
    return true;
  }
};
