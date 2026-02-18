
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface ExerciseSource {
  name: string;
  id: string;
  trim: string;
  tutorialUrl?: string;
}

async function main() {
  const sourcesPath = join(process.cwd(), process.env.SOURCES_FILE ?? 'scripts/exercise-sources.json');
  const sourcesContent = await readFile(sourcesPath, 'utf-8');
  const sources: ExerciseSource[] = JSON.parse(sourcesContent);

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ ADMIN_SECRET is not set in environment.");
    process.exit(1);
  }

  console.log(`🚀 Starting batch ingestion for ${sources.length} exercises...`);

  for (const source of sources) {
    console.log(`\n---------------------------------------------------------`);
    console.log(`📦 Ingesting: ${source.name} (ID: ${source.id})`);

    const videoUrl = `https://www.youtube.com/watch?v=${source.id}`;
    const tutorialUrl = source.tutorialUrl ?? videoUrl;

    const args = [
      'run',
      'scripts/ingest-exercise.ts',
      '--',
      '--source', videoUrl,
      '--name', source.name,
      '--start', '00:00:00',
      '--duration', source.trim,
      '--tutorial-url', tutorialUrl,
      '--admin-secret', adminSecret,
    ];
    
    const proc = spawn('bun', args, { stdio: 'inherit' });

    await new Promise<void>((resolve, reject) => {
      proc.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Success: ${source.name}`);
          resolve();
        } else {
          console.error(`❌ Failed: ${source.name} (Exit code: ${code})`);
          // We resolve anyway to continue batch
          resolve();
        }
      });
      proc.on('error', (err) => {
        console.error(`❌ Error spawning process for ${source.name}:`, err);
        resolve();
      });
    });
  }

  console.log(`\n🎉 Batch ingestion complete!`);
}

main();
