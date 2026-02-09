
const fs = require('fs');
const path = require('path');

const secret = 'adminSecret: "hayl-seed-secret-2026"';
const secretKey = 'hayl-seed-secret-2026';

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => (f.startsWith('seed-') || f.startsWith('wipe-')) && f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 0. Update Year (2026 -> 2026)
  if (content.includes('hayl-seed-secret-2026')) {
    content = content.replace(/hayl-seed-secret-2026/g, 'hayl-seed-secret-2026');
    console.log(`Updated year in ${file}`);
    changed = true;
  }

  // 1. Fix Duplicates (if any lines have double adminSecret)
  // Simple check: if "adminSecret... adminSecret...", replace with single
  if (content.match(/adminSecret: "[^"]+",\s*adminSecret:/)) {
    content = content.replace(/adminSecret: "[^"]+",\s*adminSecret: "[^"]+",/g, `${secret},`);
    console.log(`Fixed duplicates in ${file}`);
    changed = true;
  }

  // 2. Inject if missing
  if (!content.includes(secretKey)) {
    // pattern 1: seedExercises
    if (content.includes('exercises: EXERCISES') && !content.includes('exercises: EXERCISES, adminSecret')) {
        content = content.replace('exercises: EXERCISES', `exercises: EXERCISES, ${secret}`);
        changed = true;
    }

    // pattern 2: seedPrograms (array literal)
    if (content.includes('programs: [PROGRAM]') && !content.includes('programs: [PROGRAM], adminSecret')) {
        content = content.replace('programs: [PROGRAM]', `programs: [PROGRAM], ${secret}`);
        changed = true;
    }

    // pattern 3: seedPrograms (variable)
    if (content.includes('programs: PROGRAMS') && !content.includes('programs: PROGRAMS, adminSecret')) {
        content = content.replace('programs: PROGRAMS', `programs: PROGRAMS, ${secret}`);
        changed = true;
    }

    // pattern 4: seedDerivedPlan (programId shortcut)
    // Matches "programId," but distinct from "programId:"
    if (content.match(/programId,\s*$/m) || content.includes('programId,')) {
        // use stricter replace to avoid messing up "programId: ..."
        content = content.replace(/programId,(\s*)/g, `programId, ${secret},$1`);
        // Note: this might replace multiple times if multiple seedDerivedPlan calls?
        // But usually one per file except seed-plans.ts
        changed = true;
    }

    // pattern 5: seedDerivedPlan (programId explicit assignment)
    // Found in seed-plans.ts
    if (content.includes('programId: foundationsId as Id<"programs">,') && !content.includes('adminSecret')) {
         content = content.replace('programId: foundationsId as Id<"programs">,', `programId: foundationsId as Id<"programs">, ${secret},`);
         changed = true;
    }

    // pattern 6: wipeDerivedPlans
    if (content.includes('api.programs.wipeDerivedPlans, {}')) {
        content = content.replace('api.programs.wipeDerivedPlans, {}', `api.programs.wipeDerivedPlans, { ${secret} }`);
        changed = true;
    }

    if (changed) {
        console.log(`Updated ${file}`);
        fs.writeFileSync(filePath, content);
    }
  } else {
      // Check if maybe one mutation has it but another missing (e.g. seed-plans.ts has multiple)
      // For now assume if string present, it's patched, unless logic demands check.
      // But we handled dupes first.
  }
});
