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

export const getStCode = (name) => {
  const s = STATES.find(x => x.n === name);
  return s ? s.c : "";
};
