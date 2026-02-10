import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CONVEX_URL is not set.");
  process.exit(1);
}
const client = new ConvexHttpClient(convexUrl);

async function main() {
  console.log("Listing all programs...");
  const programs = await client.query(api.programs.listAll);
  console.log(`Found ${programs.length} programs:`);
  for (const p of programs) {
    console.log(`- [${p.slug}] ${p.title} (${p._id})`);
  }
}

main().catch(console.error);
