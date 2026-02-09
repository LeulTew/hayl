import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

import { Doc } from "../convex/_generated/dataModel.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function main() {
  console.log("🔍 Verifying 'Hayl Foundations' plan...");
  const programs = (await client.query(api.programs.listAll)) as Doc<"programs">[];
  const program = programs.find((p) => p.slug === "foundations-1");
  
  if (!program) {
    console.error("❌ Program not found!");
    return;
  }

  const plans = (await client.query(api.programs.getDerivedPlans, { programId: program._id })) as Doc<"derivedPlans">[];
  const plan = plans.find((p) => p.version === "v1.0.0");

  if (!plan) {
    console.error("❌ Plan v1.0.0 not found!");
    return;
  }

  console.log(`✅ Plan Found: ${plan._id}`);
  console.log(`Version: ${plan.version}`);
  console.log(`Description: "${plan.description}"`);
  console.log(`Overview Length: ${plan.overview_markdown?.length ?? 0} chars`);
  console.log(`Days Count: ${plan.days.length}`);
  console.log(`Day 1 Exercises: ${plan.days[0].phases[1].items.length}`);
  console.log(`Day 1 Note: "${plan.days[0].phases[1].items[0].note}"`);

  if (plan.description.includes("The perfect starting point")) {
    console.log("✅ Description matches high-quality draft.");
  } else {
    console.error("❌ Description looks old/generic!");
  }
}

main().catch(console.error);
