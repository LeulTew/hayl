import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const url = process.env.VITE_CONVEX_URL ?? process.env.CONVEX_URL ?? '';
const client = new ConvexHttpClient(url);
const exercises = await client.query(api.exercises.listAll, {});
const withMedia = exercises.filter((e) => e.media);
const withoutMedia = exercises.filter((e) => !e.media);
console.log('Total exercises:', exercises.length);
console.log('With media:', withMedia.length);
console.log('Without media:', withoutMedia.length);
if (withoutMedia.length > 0) {
  console.log('Missing media:', withoutMedia.map((e) => e.name).join(', '));
}
console.log('\nWith media:', withMedia.map((e) => `${e.name} (${e._id})`).join(', '));
process.exit(0);
