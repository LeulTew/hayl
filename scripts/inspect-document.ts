import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

async function main() {
  const url = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL || '';
  const client = new ConvexHttpClient(url);
  const exercises = await client.query(api.exercises.listAll, {});
  const lateralRaise = exercises.find(e => e.name === "Lateral Raise");
  
  if (!lateralRaise) {
    console.log("Lateral Raise not found");
    process.exit(1);
  }

  console.log("Lateral Raise Document:");
  console.log(JSON.stringify(lateralRaise, null, 2));

  if (lateralRaise.mediaResolved) {
      console.log("\nResolved URLs:");
      console.log(JSON.stringify(lateralRaise.mediaResolved.urls, null, 2));
  } else {
      console.log("\nmediaResolved is MISSING");
  }
  
  process.exit(0);
}

main();
