// src/utils/gstCalc.js

// priceMode 'inclusive' = the rate already contains GST, so the taxable
// amount is net / (1 + gp/100). Missing priceMode (older bills) = exclusive.
// Must stay identical to compute_bill_totals() in 0007_billing_rules.sql.
export function recalc(items, gstOn, tt, priceMode = 'exclusive') {
  const inclusive = gstOn && priceMode === 'inclusive';
  let sA = 0, sC = 0, sS = 0, sI = 0, sT = 0, sD = 0;

  const processedItems = items.map(item => {
    const qty = Math.max(0, parseFloat(item.qty) || 0);
    const rate = Math.max(0, parseFloat(item.rate) || 0);
    const disc = Math.min(100, Math.max(0, parseFloat(item.disc) || 0));
    const gp = parseFloat(item.gp) || 0;
    
    const gross = qty * rate;
    const net = gross - (gross * disc / 100);
    const amt = inclusive ? net / (1 + gp / 100) : net;
    sD += gross - net; // money taken off by the Disc % column
    
    let c = 0, s = 0, ig = 0;
    
    if (gstOn) {
      if (tt === "intra") {
        c = amt * gp / 2 / 100;
        s = c;
      } else {
        ig = amt * gp / 100;
      }
    }
    
    const tot = amt + c + s + ig;
    
    sA += amt;
    sC += c;
    sS += s;
    sI += ig;
    sT += tot;
    
    return {
      ...item,
      fa: fmt2(amt),
      fca: fmt2(c),
      fsp: gstOn ? (gp / 2) + "%" : "—",
      fsa: fmt2(s),
      fip: gstOn ? gp + "%" : "—",
      fia: fmt2(ig),
      ft: fmt2(tot)
    };
  });

  const rnd = Math.round(sT);
  const diff = rnd - sT;
  
  return {
    processedItems,
    totals: {
      sumAmt: sA,
      sumCgst: sC,
      sumSgst: sS,
      sumIgst: sI,
      sumDisc: sD, // display only (server keeps its own totals)
      roundOff: diff,
      grand: rnd
    }
  };
}

export function autoTax(shopState, custState) {
  // If customer state isn't defined, default to shop state (intra)
  if (!custState) return "intra";
  return shopState === custState ? "intra" : "inter";
}

// Indian digit grouping with 2 decimals: 123456.5 -> "1,23,456.50"
export function fmt2(n) {
  const v = parseFloat(n);
  return (Number.isFinite(v) ? v : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCurrency(n) {
  return "₹" + fmt2(n);
}
