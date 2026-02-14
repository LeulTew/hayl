import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function main() {
  console.log("🔍 Verifying Programs and Plans...");
  
  const programs = await client.query(api.programs.listAll);
  console.log(`Found ${programs.length} programs.`);

  let missingCount = 0;

  for (const prog of programs) {
    // Check for derived plans
    const plans = await client.query(api.programs.getDerivedPlans, { programId: prog._id });
    
    console.log(`\n📄 [${prog.slug}] ${prog.title}`);
    if (plans.length === 0) {
        console.log(`   ❌ NO PLANS FOUND!`);
        missingCount++;
    } else {
        console.log(`   ✅ ${plans.length} variants found.`);
        plans.forEach(p => console.log(`      - ${p.variant.difficulty} (${p.variant.splitFreq})`));
    }
  }

  if (missingCount > 0) {
      console.log(`\n❌ Total Programs with 0 variants: ${missingCount}`);
      process.exit(1);
  } else {
      console.log("\n✅ All programs have at least one variant.");
  }
}

main().catch(console.error);
