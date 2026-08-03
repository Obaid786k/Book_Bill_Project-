import fs from 'fs';

const data = fs.readFileSync('C:/Users/UKHBA.RAMBOLL.002/.gemini/antigravity/brain/2e3ebc39-fdc1-46ed-a9cf-8bee6a5eb594/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = data.split('\n');

for (const line of lines) {
  if (line.includes('"type":"USER_INPUT"') && line.includes('PHASE 3')) {
    const json = JSON.parse(line);
    const content = json.content;
    const match = content.match(/## PHASE 3[\s\S]*?(?=## PHASE 4|## After This|$)/);
    if (match) {
      fs.writeFileSync('phase3.txt', match[0]);
      console.log('Found it!');
      process.exit(0);
    }
  }
}
console.log('Not found');
