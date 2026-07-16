const fs = require('fs');
const h = fs.readFileSync('c:/Qcanary/.diagnosis-screenshots/live-pricing.html', 'utf8');
const kws = ['$9', '$39', '$24', 'Starter', 'Solo', 'Team', 'Pro', 'Business', 'Enterprise'];
for (const kw of kws) {
  console.log(`${kw}: ${h.split(kw).length - 1} occurrences`);
}
const solo = h.indexOf('Solo');
console.log('Solo context:', h.slice(solo - 60, solo + 180).replace(/\s+/g, ' '));
const starter = h.indexOf('Starter');
console.log('Starter context:', h.slice(starter - 60, starter + 180).replace(/\s+/g, ' '));
