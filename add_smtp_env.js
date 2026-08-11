const fs = require('fs');

const envPath = '.env.local';
let content = '';

if (fs.existsSync(envPath)) {
  content = fs.readFileSync(envPath, 'utf8');
}

if (!content.includes('SMTP_HOST')) {
  content += `\n# SMTP Configuration for Email Marketing\n`;
  content += `SMTP_HOST="smtp-fr.securemail.pro"\n`;
  content += `SMTP_PORT="465"\n`;
  content += `SMTP_USER="support@frettalent.fr"\n`;
  content += `SMTP_PASS="Gabin.02350"\n`;
  
  fs.writeFileSync(envPath, content);
  console.log('SMTP credentials added to .env.local');
} else {
  console.log('SMTP credentials already exist in .env.local');
}
