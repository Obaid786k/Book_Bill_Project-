// src/utils/gstCalc.js

export function recalc(items, gstOn, tt) {
  let sA = 0, sC = 0, sS = 0, sI = 0, sT = 0;

  const processedItems = items.map(item => {
    const qty = Math.max(0, parseFloat(item.qty) || 0);
    const rate = Math.max(0, parseFloat(item.rate) || 0);
    const disc = Math.min(100, Math.max(0, parseFloat(item.disc) || 0));
    const gp = parseFloat(item.gp) || 0;
    
    const gross = qty * rate;
    const amt = gross - (gross * disc / 100);
    
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
      fa: amt.toFixed(2),
      fca: c.toFixed(2),
      fsp: gstOn ? (gp / 2) + "%" : "—",
      fsa: s.toFixed(2),
      fip: gstOn ? gp + "%" : "—",
      fia: ig.toFixed(2),
      ft: tot.toFixed(2)
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

export function formatCurrency(n) {
  return "₹" + parseFloat(n).toFixed(2);
}
