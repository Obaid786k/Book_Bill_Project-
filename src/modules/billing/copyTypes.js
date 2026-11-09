// Invoice copy labels, in the order GST rules prescribe for goods:
// original → recipient, duplicate → transporter, triplicate → supplier.
export const COPY_TYPES = [
  'Original for Recipient',
  'Duplicate for Transporter',
  'Triplicate for Supplier',
];

// Labels used before the fix (duplicate/triplicate recipients were swapped).
// Mapped by copy number so the watermark on old bills/drafts stays the same.
const LEGACY_COPY_TYPES = {
  'Duplicate for Supplier': COPY_TYPES[1],
  'Triplicate for Transporter': COPY_TYPES[2],
};

export const normalizeCopyType = (label) =>
  COPY_TYPES.includes(label) ? label : (LEGACY_COPY_TYPES[label] || COPY_TYPES[0]);
