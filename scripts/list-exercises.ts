import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function main() {
  const exercises = await client.query(api.exercises.listAll);
  console.log(JSON.stringify(exercises.map(e => e.name), null, 2));
}

main().catch(console.error);
