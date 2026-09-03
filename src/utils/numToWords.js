// src/utils/numToWords.js

export function numToWords(n) {
  n = Math.round(Math.abs(n));
  if (!n) return "Zero";
  
  const o = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const t = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const two = n => n < 20 ? o[n] : t[Math.floor(n / 10)] + (n % 10 ? " " + o[n % 10] : "");
  
  const thr = n => {
    let s = "";
    if (n >= 100) {
      s += o[Math.floor(n / 100)] + " Hundred";
      n %= 100;
      if (n) s += " ";
    }
    if (n) s += two(n);
    return s;
  };
  
  let res = "";
  const cr = Math.floor(n / 1e7);
  n %= 1e7;
  const lk = Math.floor(n / 1e5);
  n %= 1e5;
  const th = Math.floor(n / 1e3);
  n %= 1e3;
  
  if (cr) res += thr(cr) + " Crore ";
  if (lk) res += thr(lk) + " Lakh ";
  if (th) res += thr(th) + " Thousand ";
  if (n) res += thr(n);
  
  return res.trim();
}
