import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import type { Id } from '../convex/_generated/dataModel.js';

type ArgsMap = Record<string, string | boolean>;

type ProbeData = {
  width: number;
  height: number;
  durationMs: number;
};

function parseArgs(argv: string[]): ArgsMap {
  const parsed: ArgsMap = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function getRequired(args: ArgsMap, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required argument --${key}`);
  }
  return value;
}

function getOptional(args: ArgsMap, key: string): string | undefined {
  const value = args[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

async function run(cmd: string, cmdArgs: string[]) {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${cmd} failed with exit code ${code}`));
      }
    });
  });
}

async function runCapture(cmd: string, cmdArgs: string[]): Promise<string> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'inherit'] });
    child.stdout.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${cmd} failed with exit code ${code}`));
      }
    });
  });
  return Buffer.concat(chunks).toString('utf8');
}

async function ensureBinaryExists(binary: string) {
  await run('which', [binary]);
}

function isUrl(input: string) {
  return /^https?:\/\//i.test(input);
}

async function sha256Of(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function probeVideo(filePath: string): Promise<ProbeData> {
  const output = await runCapture('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height:format=duration',
    '-of',
    'json',
    filePath,
  ]);

  const parsed = JSON.parse(output) as {
    streams?: Array<{ width?: number; height?: number }>;
    format?: { duration?: string };
  };

  const width = parsed.streams?.[0]?.width ?? 0;
  const height = parsed.streams?.[0]?.height ?? 0;
  const durationMs = Math.round(Number(parsed.format?.duration ?? '0') * 1000);

  if (width <= 0 || height <= 0) {
    throw new Error('Unable to read video dimensions from ffprobe');
  }

  return { width, height, durationMs };
}

async function uploadToConvexStorage(uploadUrl: string, filePath: string, mime: string): Promise<Id<'_storage'>> {
  const file = Bun.file(filePath);
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': mime },
    body: file,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Convex upload failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { storageId?: Id<'_storage'> };
  if (!payload.storageId) throw new Error('Convex upload did not return storageId');
  return payload.storageId;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const source = getRequired(args, 'source');
  const adminSecret = getRequired(args, 'admin-secret');
  const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('Set CONVEX_URL or VITE_CONVEX_URL in environment');
  }

  await ensureBinaryExists('ffmpeg');
  await ensureBinaryExists('ffprobe');
  await ensureBinaryExists('yt-dlp');

  const start = getOptional(args, 'start');
  const end = getOptional(args, 'end');
  const duration = getOptional(args, 'duration');

  const exerciseIdArg = getOptional(args, 'exercise-id');
  const name = getOptional(args, 'name');
  const muscleGroup = getOptional(args, 'muscle-group');
  const instructions = getOptional(args, 'instructions');

  const tempDir = await mkdtemp(join(tmpdir(), 'hayl-ingest-'));

  try {
    const sourceFile = join(tempDir, 'source.mp4');
    const trimmedFile = join(tempDir, 'trimmed.mp4');
    const mp4File = join(tempDir, 'exercise.mp4');
    const webmFile = join(tempDir, 'exercise.webm');
    const posterFile = join(tempDir, 'poster.jpg');
    const tinyFile = join(tempDir, 'tiny.webp');

    if (isUrl(source)) {
      await run('yt-dlp', ['-o', sourceFile, '-f', 'mp4', source]);
    } else {
      const resolvedSource = resolve(source);
      await run('cp', [resolvedSource, sourceFile]);
    }

    const trimArgs = ['-y', '-i', sourceFile];
    if (start) trimArgs.push('-ss', start);
    if (end) {
      trimArgs.push('-to', end);
    } else if (duration) {
      trimArgs.push('-t', duration);
    }
    trimArgs.push('-an', '-vf', 'scale=min(720\\,iw):-2', '-c:v', 'libx264', '-preset', 'veryfast', trimmedFile);
    await run('ffmpeg', trimArgs);

    await run('ffmpeg', [
      '-y',
      '-i',
      trimmedFile,
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '24',
      '-movflags',
      '+faststart',
      mp4File,
    ]);

    await run('ffmpeg', [
      '-y',
      '-i',
      trimmedFile,
      '-an',
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '34',
      '-b:v',
      '0',
      webmFile,
    ]);

    await run('ffmpeg', ['-y', '-i', trimmedFile, '-frames:v', '1', '-q:v', '3', posterFile]);
    await run('ffmpeg', ['-y', '-i', posterFile, '-vf', 'scale=16:-1', tinyFile]);

    const [videoProbe, mp4Stat, webmStat, posterStat] = await Promise.all([
      probeVideo(trimmedFile),
      stat(mp4File),
      stat(webmFile),
      stat(posterFile),
    ]);

    const lqipBase64 = (await readFile(tinyFile)).toString('base64');
    const checksum = await sha256Of(trimmedFile);

    const client = new ConvexHttpClient(convexUrl);

    let exerciseId: Id<'exercises'>;
    if (exerciseIdArg) {
      exerciseId = exerciseIdArg as Id<'exercises'>;
    } else {
      if (!name || !muscleGroup || !instructions) {
        throw new Error('Provide --exercise-id OR all of --name --muscle-group --instructions');
      }

      exerciseId = await client.mutation(api.exercises.createExercise, {
        name,
        muscleGroup,
        instructions,
        adminSecret,
      });
    }

    const uploadUrls = await client.mutation(api.exercises.generateMediaUploadUrls, {
      adminSecret,
      includeMp4: true,
      includeWebm: true,
      includePoster: true,
    });

    if (!uploadUrls.mp4UploadUrl || !uploadUrls.webmUploadUrl || !uploadUrls.posterUploadUrl) {
      throw new Error('Did not receive all required upload URLs from Convex');
    }

    const [mp4StorageId, webmStorageId, posterStorageId] = await Promise.all([
      uploadToConvexStorage(uploadUrls.mp4UploadUrl, mp4File, 'video/mp4'),
      uploadToConvexStorage(uploadUrls.webmUploadUrl, webmFile, 'video/webm'),
      uploadToConvexStorage(uploadUrls.posterUploadUrl, posterFile, 'image/jpeg'),
    ]);

    await client.mutation(api.exercises.finalizeExerciseMedia, {
      adminSecret,
      exerciseId,
      sourceUrl: source,
      ingestedBy: process.env.USER || process.env.LOGNAME || 'local-script',
      checksum,
      width: videoProbe.width,
      height: videoProbe.height,
      aspectRatio: videoProbe.width / videoProbe.height,
      durationMs: videoProbe.durationMs,
      placeholder: {
        lqipBase64,
        posterStorageId,
      },
      mp4: {
        storageId: mp4StorageId,
        bytes: mp4Stat.size,
        mime: 'video/mp4',
      },
      webm: {
        storageId: webmStorageId,
        bytes: webmStat.size,
        mime: 'video/webm',
      },
    });

    console.log('✅ Exercise media ingested successfully');
    console.log(`Exercise ID: ${exerciseId}`);
    console.log(`MP4: ${basename(mp4File)} (${mp4Stat.size} bytes)`);
    console.log(`WEBM: ${basename(webmFile)} (${webmStat.size} bytes)`);
    console.log(`Poster: ${basename(posterFile)} (${posterStat.size} bytes)`);
    console.log(`Source checksum: ${checksum}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('❌ Ingestion failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
