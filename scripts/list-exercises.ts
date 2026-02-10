import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CONVEX_URL is not set.");
  process.exit(1);
}
const client = new ConvexHttpClient(convexUrl);


async function main() {
  const exercises = await client.query(api.exercises.listAll);
  console.log(JSON.stringify(exercises.map(e => e.name), null, 2));
}

main().catch(console.error);
