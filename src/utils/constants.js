// src/utils/constants.js

export const STATES = [
  { n: "Andhra Pradesh", c: "37" }, { n: "Arunachal Pradesh", c: "12" }, { n: "Assam", c: "18" },
  { n: "Bihar", c: "10" }, { n: "Chhattisgarh", c: "22" }, { n: "Goa", c: "30" }, { n: "Gujarat", c: "24" },
  { n: "Haryana", c: "06" }, { n: "Himachal Pradesh", c: "02" }, { n: "Jharkhand", c: "20" },
  { n: "Karnataka", c: "29" }, { n: "Kerala", c: "32" }, { n: "Madhya Pradesh", c: "23" },
  { n: "Maharashtra", c: "27" }, { n: "Manipur", c: "14" }, { n: "Meghalaya", c: "17" },
  { n: "Mizoram", c: "15" }, { n: "Nagaland", c: "13" }, { n: "Odisha", c: "21" }, { n: "Punjab", c: "03" },
  { n: "Rajasthan", c: "08" }, { n: "Sikkim", c: "11" }, { n: "Tamil Nadu", c: "33" },
  { n: "Telangana", c: "36" }, { n: "Tripura", c: "16" }, { n: "Uttar Pradesh", c: "09" },
  { n: "Uttarakhand", c: "05" }, { n: "West Bengal", c: "19" },
  { n: "Andaman and Nicobar Islands", c: "35" }, { n: "Chandigarh", c: "04" },
  { n: "Dadra and Nagar Haveli and Daman and Diu", c: "26" }, { n: "Delhi", c: "07" },
  { n: "Jammu and Kashmir", c: "01" }, { n: "Ladakh", c: "38" },
  { n: "Lakshadweep", c: "31" }, { n: "Puducherry", c: "34" }
];

export const SEED_TPLS = [
  {
    id: "s1", icon: "🛒", name: "Kirana / General Store",
    profile: {
      shopName: "Sharma General Store", tagline: "Quality Products, Fair Prices",
      shopAddress: "123, Nehru Market Road, Lucknow, UP - 226001",
      shopPhone: "+91 98765 43210", shopEmail: "sharmastore@example.com",
      shopGstin: "09ABCDE1234F1Z5", shopState: "Uttar Pradesh",
      upiId: "sharmastore@upi", bankAcc: "", ifsc: "",
      terms: "1. Goods once sold will not be taken back or exchanged.\n2. Payment due within 7 days.\n3. Subject to Lucknow jurisdiction."
    },
    settings: { gstOn: true, tt: "intra", payMode: "Cash" }
  },
  {
    id: "s2", icon: "🏥", name: "Medical / Pharmacy",
    profile: {
      shopName: "Life Care Pharmacy", tagline: "Your Health, Our Priority",
      shopAddress: "Shop No. 5, Medical Square, New Delhi - 110001",
      shopPhone: "+91 98100 00000", shopEmail: "lifecare@example.com",
      shopGstin: "07ABCDE1234F1Z5", shopState: "Delhi",
      upiId: "lifecare@upi", bankAcc: "", ifsc: "",
      terms: "1. Medicines on valid prescription only.\n2. Check expiry before purchase.\n3. Subject to Delhi jurisdiction."
    },
    settings: { gstOn: true, tt: "intra", payMode: "Cash" }
  },
  {
    id: "s3", icon: "🍽️", name: "Restaurant / Food",
    profile: {
      shopName: "Spice Garden Restaurant", tagline: "Authentic Flavours, Warm Hospitality",
      shopAddress: "MG Road, Bengaluru, Karnataka - 560001",
      shopPhone: "+91 97000 00000", shopEmail: "spicegarden@example.com",
      shopGstin: "29ABCDE1234F1Z5", shopState: "Karnataka",
      upiId: "spicegarden@upi", bankAcc: "", ifsc: "",
      terms: "1. Prices inclusive of applicable taxes.\n2. No outside food allowed.\n3. Bengaluru jurisdiction."
    },
    settings: { gstOn: true, tt: "intra", payMode: "Cash" }
  },
  {
    id: "s4", icon: "🔧", name: "Services / Consulting",
    profile: {
      shopName: "TechServe Solutions", tagline: "Professional IT & Business Services",
      shopAddress: "Sector 18, Noida, Uttar Pradesh - 201301",
      shopPhone: "+91 99000 00000", shopEmail: "techserve@example.com",
      shopGstin: "09ABCDE5678G1Z5", shopState: "Uttar Pradesh",
      upiId: "", bankAcc: "HDFC Bank, A/C 1234567890", ifsc: "HDFC0001234",
      terms: "1. Payment due within 15 days.\n2. Retainer fees non-refundable.\n3. Noida jurisdiction."
    },
    settings: { gstOn: true, tt: "intra", payMode: "Bank Transfer" }
  }
];

export const getStCode = (name) => {
  const s = STATES.find(x => x.n === name);
  return s ? s.c : "";
};
