const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => (f.startsWith('seed-') || f.startsWith('wipe-')) && f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Inject Env Check at the start of main()
  // We look for the start of the main function. 
  // Most scripts have "async function main() {"
  if (content.includes('async function main() {') && !content.includes('process.env.ADMIN_SECRET')) {
    content = content.replace('async function main() {', 
`async function main() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }
`);
    console.log(`Injected env check in ${file}`);
    changed = true;
  }

  // 2. Replace hardcoded secret with variable
  // Matches adminSecret: "hayl-seed-secret-2026" -> adminSecret: adminSecret
  if (content.includes('adminSecret: "hayl-seed-secret-2026"')) {
    content = content.replace(/adminSecret: "hayl-seed-secret-2026"/g, 'adminSecret: adminSecret');
    console.log(`Replaced hardcoded secret in ${file}`);
    changed = true;
  }

  // 3. Handle leftover 2024 or other strings if they exist (safety net)
  if (content.includes('adminSecret: "hayl-seed-secret-2024"')) {
    content = content.replace(/adminSecret: "hayl-seed-secret-2024"/g, 'adminSecret: adminSecret');
    console.log(`Replaced stale 2024 secret in ${file}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
