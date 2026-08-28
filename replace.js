const fs = require('fs');
const file = 'components/templates/PremiumServicesTemplate.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/amber-/g, 'teal-');
content = content.replace(/rose-/g, 'cyan-');
content = content.replace(/bg-\[#1a1612\]/g, 'bg-[#0f2b28]');
content = content.replace(/flex-col-reverse/g, 'flex-col');

fs.writeFileSync(file, content);
console.log('Replaced colors and layout.');
