// One place for chart colours, axis and tooltip style. Reuse in every recharts chart.
export const CHART = {
  current: '#1B3A6B',   // navy — main series / this period
  previous: '#8FA6C8',  // navy-300 — previous period (dashed)
  accent: '#B45309',    // gold — second series (e.g. profit)
  grid: '#E6ECF5',
  axisText: '#4A5568',  // ink2
  cursor: 'rgba(27,58,107,0.06)',
  height: 260,
};

// Categorical colours for donuts / multi-series (navy family + gold + green).
export const SERIES = ['#1B3A6B', '#2756A0', '#8FA6C8', '#B45309', '#276749'];

export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: CHART.axisText },
};

export const gridProps = { vertical: false, stroke: CHART.grid };
export const gridPropsVertical = { horizontal: false, stroke: CHART.grid };

// Bars: rounded top, soft hover band.
export const barRadius = [4, 4, 0, 0];
export const barRadiusH = [0, 4, 4, 0];
export const barCursor = { fill: CHART.cursor };
export const lineCursor = { stroke: CHART.grid, strokeWidth: 1 };

export const tooltipBoxClass =
  'bg-paper border border-bb2 rounded-lg shadow-[0_8px_24px_rgba(15,28,46,.12)] px-3 py-2 text-[12px]';

// ₹ compact labels: ₹950, ₹1.5k, ₹1.2L, ₹3.4Cr
export const inrCompact = (n) => {
  const v = Math.abs(Number(n) || 0);
  const trim = (x) => String(Number(x.toFixed(1)));
  if (v >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (v >= 1e5) return `₹${trim(n / 1e5)}L`;
  if (v >= 1e3) return `₹${trim(n / 1e3)}k`;
  return `₹${Math.round(n)}`;
};

export const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
export const num = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');
