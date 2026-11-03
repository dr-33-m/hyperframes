import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join } from "node:path";
import type { Span } from "@hyperframes/core/audio-analysis";
import { loadTranscript } from "../../whisper/normalize.js";
import { formatRead } from "./format.js";
import { pitchTrack } from "./pitch.js";
import { PITCH_RATE, READ_RATE, decodeMono, round, spanDb } from "./signal.js";
import { findEffects } from "./effects.js";
import { READ_VERSION, type ReadAudio } from "./types.js";
import { voiceFromWords, type TimedWord } from "./voice.js";

export interface ReadOptions {
  /** Where analyses are kept, normally the project's `.hyperframes/read-audio`. */
  cacheDir: string;
  /** A transcript of the recording; `<file>.transcript.json` next to it is used when absent. */
  transcript?: string;
}

export interface ReadResult {
  analysis: ReadAudio;
  /** The whole recording as text, for grep. */
  textPath: string;
  jsonPath: string;
  cached: boolean;
}

async function sha256(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest("hex");
}

function transcriptFor(path: string, given?: string): string | null {
  if (given) return given;
  const sidecar = `${path}.transcript.json`;
  return existsSync(sidecar) ? sidecar : null;
}

function wordsOf(transcript: string): TimedWord[] {
  return loadTranscript(transcript).words.map(({ text, start, end }) => ({ text, start, end }));
}

const fingerprint = (path: string | null) =>
  path ? createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16) : "none";

function writeAtomic(path: string, content: string) {
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, content);
  renameSync(temporary, path);
}

const CACHE_REVISION = 2;

interface CacheEntry {
  revision: number;
  analysis: ReadAudio;
  transcriptKey: string;
}

const transcribeHint = (file: string) => `run hyperframes transcribe ${file} and pass --transcript`;

async function analyze(
  path: string,
  file: string,
  sha: string,
  transcript: string | null,
): Promise<ReadAudio> {
  const warnings: string[] = [];
  const words = transcript ? wordsOf(transcript) : [];
  const samples = await decodeMono(path);
  const about = base(file, sha, round(samples.length / READ_RATE, 3), transcript);
  if (!words.length) {
    warnings.push(
      `no transcript: voice and effects are not read, because the mix alone does not tell speech from music; ${transcribeHint(file)}`,
    );
    return { ...about, voice: null, effects: null, music: null, ambience: null, warnings };
  }
  const pitch = pitchTrack(await decodeMono(path, PITCH_RATE));
  const levelOf = (span: Span) => spanDb(samples, READ_RATE, span.start, span.end);
  const voice = voiceFromWords(words, pitch, levelOf);
  warnings.push("without stems, effects under speech are not found and music is not read");
  const effects = findEffects({
    sources: [{ samples }],
    sampleRate: READ_RATE,
    mix: samples,
    music: null,
    beats: [],
    speech: voice.sentences,
  });
  return { ...about, voice, effects, music: null, ambience: null, warnings };
}

function base(
  file: string,
  sha: string,
  duration: number,
  transcript: string | null,
): Omit<ReadAudio, "voice" | "effects" | "music" | "ambience" | "warnings"> {
  return {
    version: READ_VERSION,
    file,
    sha256: sha,
    duration,
    separation: "mix",
    stems: [],
    stemsDir: null,
    voiceFreeMix: null,
    bpm: null,
    description: null,
    transcript: transcript ? basename(transcript) : null,
  };
}

/** Read a recording as time-stamped voice and effect events, computed once per file content. */
export async function readAudio(
  path: string,
  file: string,
  options: ReadOptions,
): Promise<ReadResult> {
  const sha = await sha256(path);
  const transcript = transcriptFor(path, options.transcript);
  const transcriptKey = fingerprint(transcript);
  const stem = `${basename(file, extname(file)).replace(/[^\w.-]/g, "_")}-${sha.slice(0, 12)}`;
  mkdirSync(options.cacheDir, { recursive: true });
  const jsonPath = join(options.cacheDir, `${stem}.json`);
  const textPath = join(options.cacheDir, `${stem}.txt`);
  if (existsSync(jsonPath) && existsSync(textPath)) {
    const entry = JSON.parse(readFileSync(jsonPath, "utf8")) as CacheEntry;
    if (
      entry.analysis.version === READ_VERSION &&
      entry.revision === CACHE_REVISION &&
      entry.transcriptKey === transcriptKey
    )
      return { analysis: entry.analysis, textPath, jsonPath, cached: true };
  }
  const analysis = await analyze(path, file, sha, transcript);
  writeAtomic(
    jsonPath,
    JSON.stringify({ revision: CACHE_REVISION, analysis, transcriptKey } satisfies CacheEntry),
  );
  writeAtomic(textPath, formatRead(analysis));
  return { analysis, textPath, jsonPath, cached: false };
}
