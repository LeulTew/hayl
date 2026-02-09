import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function main() {
  console.log("Listing all programs...");
  const programs = await client.query(api.programs.listAll);
  console.log(`Found ${programs.length} programs:`);
  for (const p of programs) {
    console.log(`- [${p.slug}] ${p.title} (${p._id})`);
  }
}

main().catch(console.error);
