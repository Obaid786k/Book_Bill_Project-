import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let emptyStateMissing = [];
let loadingMissing = [];
let confirms = [];
let hardcodedColors = [];
let placeholders = [];
let toasts = [];

const colorRegex = /bg-(?:red|blue|green|yellow|indigo|purple|pink|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d{2,3}/g;
const hexRegex = /#[0-9A-Fa-f]{3,6}/g;

walkDir('./src', function(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for lists/tables that might need empty states
  if (content.includes('.map(') && !content.includes('EmptyState')) {
    emptyStateMissing.push(filePath);
  }
  
  // Check for data fetching loading states that don't use Skeleton
  if ((content.includes('isLoading') || content.includes('loading')) && (!content.includes('Skeleton') && !content.includes('skeleton'))) {
    loadingMissing.push(filePath);
  }

  // Check for confirms
  if (content.includes('confirm(')) {
    confirms.push(filePath);
  }

  // Check for toasts
  if (content.includes('toast(') || content.includes('toast.')) {
    toasts.push(filePath);
  }

  // Check for hardcoded colors (excluding CSS variables)
  let m1 = content.match(colorRegex);
  if (m1) {
    hardcodedColors.push({file: filePath, matches: m1});
  }
  let m2 = content.match(hexRegex);
  // filter out valid hexes if they are just inside strings? let's just log them
  if (m2) {
    hardcodedColors.push({file: filePath, matches: m2});
  }

  // Check for coming soon
  if (content.toLowerCase().includes('coming soon')) {
    placeholders.push(filePath);
  }
});

console.log("=== Empty State (Potentially Missing) ===");
console.log(emptyStateMissing.join('\n'));

console.log("\n=== Loading (Potentially Missing Skeleton) ===");
console.log(loadingMissing.join('\n'));

console.log("\n=== Confirms ===");
console.log(confirms.join('\n'));

console.log("\n=== Toasts ===");
console.log(toasts.join('\n'));

console.log("\n=== Hardcoded Colors ===");
hardcodedColors.forEach(h => console.log(h.file, h.matches.join(', ')));

console.log("\n=== Placeholders ===");
console.log(placeholders.join('\n'));
